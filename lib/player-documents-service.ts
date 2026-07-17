import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_DEFINITIONS,
  PLAYER_DOCUMENTS_BUCKET,
  getDefaultDocumentsState,
  isValidHttpUrl,
  toStorageDocumentType,
  toUiDocumentType,
  type DocumentTypeId,
  type PlayerDocumentsState,
  type UploadedDocument,
} from "@/lib/player-documents";

const SIGNED_URL_SECONDS = 60 * 60;

type PlayerDocumentRow = {
  id: string;
  player_id: string;
  document_type: string;
  file_name: string | null;
  storage_path: string | null;
  public_url: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentMetadataInput = {
  fileName: string | null;
  storagePath: string | null;
  publicUrl: string | null;
};

async function requireCurrentPlayer(): Promise<{
  userId: string;
  playerId: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: player, error } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!player?.id) {
    const { data: created, error: insertError } = await supabase
      .from("players")
      .insert({
        user_id: user.id,
        full_name:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "",
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return { userId: user.id, playerId: created.id as string };
  }

  return { userId: user.id, playerId: player.id as string };
}

async function mapRowToUploaded(
  row: PlayerDocumentRow,
): Promise<UploadedDocument | null> {
  const uiId = toUiDocumentType(row.document_type);
  if (!uiId) return null;

  const definition = DOCUMENT_DEFINITIONS.find((def) => def.id === uiId);
  const uploadedAt = row.updated_at || row.created_at;

  if (definition?.kind === "url") {
    return {
      id: uiId,
      url: row.public_url ?? undefined,
      uploadedAt,
    };
  }

  let url: string | undefined = row.public_url ?? undefined;

  if (row.storage_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from(PLAYER_DOCUMENTS_BUCKET)
      .createSignedUrl(row.storage_path, SIGNED_URL_SECONDS);
    if (data?.signedUrl) {
      url = data.signedUrl;
    }
  }

  return {
    id: uiId,
    fileName: row.file_name ?? undefined,
    url,
    uploadedAt,
  };
}

async function removeStorageObject(path: string | null | undefined) {
  if (!path) return;
  const supabase = await createClient();
  await supabase.storage.from(PLAYER_DOCUMENTS_BUCKET).remove([path]);
}

/** Load all documents for the authenticated player. */
export async function getPlayerDocuments(): Promise<PlayerDocumentsState> {
  const { playerId } = await requireCurrentPlayer();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_documents")
    .select(
      "id, player_id, document_type, file_name, storage_path, public_url, created_at, updated_at",
    )
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  const state = getDefaultDocumentsState();
  for (const row of (data as PlayerDocumentRow[] | null) ?? []) {
    const mapped = await mapRowToUploaded(row);
    if (mapped) {
      state[mapped.id] = mapped;
    }
  }
  return state;
}

/**
 * Persist document metadata after a browser-side Storage upload (or URL save).
 * Does not accept file binaries — only paths/URLs.
 */
export async function saveDocumentMetadata(
  documentType: DocumentTypeId,
  metadata: DocumentMetadataInput,
): Promise<UploadedDocument> {
  const definition = DOCUMENT_DEFINITIONS.find((def) => def.id === documentType);
  if (!definition) {
    throw new Error("Unknown document type.");
  }

  const { playerId } = await requireCurrentPlayer();
  const supabase = await createClient();
  const storageType = toStorageDocumentType(documentType);

  if (definition.kind === "url") {
    const url = metadata.publicUrl?.trim() ?? "";
    if (!isValidHttpUrl(url)) {
      throw new Error("Enter a valid http(s) URL.");
    }
  } else if (!metadata.storagePath || !metadata.fileName) {
    throw new Error("File metadata is required.");
  }

  const { data: existing } = await supabase
    .from("player_documents")
    .select("storage_path")
    .eq("player_id", playerId)
    .eq("document_type", storageType)
    .maybeSingle();

  const previousPath = (existing?.storage_path as string | null) ?? null;
  if (
    previousPath &&
    previousPath !== metadata.storagePath
  ) {
    await removeStorageObject(previousPath);
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("player_documents")
    .upsert(
      {
        player_id: playerId,
        document_type: storageType,
        file_name: metadata.fileName,
        storage_path: metadata.storagePath,
        public_url: metadata.publicUrl,
        updated_at: now,
      },
      { onConflict: "player_id,document_type" },
    )
    .select(
      "id, player_id, document_type, file_name, storage_path, public_url, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const mapped = await mapRowToUploaded(data as PlayerDocumentRow);
  if (!mapped) throw new Error("Failed to save document metadata.");
  return mapped;
}

/** Alias kept for service API clarity. */
export async function uploadDocument(
  documentType: DocumentTypeId,
  metadata: DocumentMetadataInput,
): Promise<UploadedDocument> {
  return saveDocumentMetadata(documentType, metadata);
}

/** Alias for replace — metadata update after a new browser upload. */
export async function replaceDocument(
  documentType: DocumentTypeId,
  metadata: DocumentMetadataInput,
): Promise<UploadedDocument> {
  return saveDocumentMetadata(documentType, metadata);
}

/** Remove a document row and its Storage object (path only, no file body). */
export async function deleteDocument(
  documentType: DocumentTypeId,
): Promise<void> {
  const { playerId } = await requireCurrentPlayer();
  const supabase = await createClient();
  const storageType = toStorageDocumentType(documentType);

  const { data: existing, error: selectError } = await supabase
    .from("player_documents")
    .select("id, storage_path")
    .eq("player_id", playerId)
    .eq("document_type", storageType)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (!existing) return;

  await removeStorageObject(existing.storage_path as string | null);

  const { error } = await supabase
    .from("player_documents")
    .delete()
    .eq("id", existing.id);

  if (error) {
    throw new Error(error.message);
  }
}
