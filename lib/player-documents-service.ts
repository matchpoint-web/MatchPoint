import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";
import { ensureCurrentPlayerId } from "@/lib/players/queries";
import {
  DOCUMENT_DEFINITIONS,
  getDefaultDocumentsState,
  isValidHttpUrl,
  toStorageDocumentType,
  toUiDocumentType,
  type DocumentTypeId,
  type PlayerDocumentsState,
  type UploadedDocument,
} from "@/lib/player-documents";
import {
  assertDocumentFile,
  buildDocumentStoragePath,
  createSignedStorageUrl,
  DOCUMENTS_BUCKET,
  removeStorageObject,
  uploadStorageObject,
} from "@/lib/storage/queries";

type PlayerDocumentRow = Tables<"player_documents">;

const DOCUMENT_SELECT =
  "id, player_id, document_type, file_name, storage_path, public_url, created_at, updated_at" as const;

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

  const playerId = await ensureCurrentPlayerId();
  return { userId: user.id, playerId };
}

async function mapRowToUploaded(
  row: PlayerDocumentRow,
  context: string,
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
    console.log(
      `[documents] ${context}:signing row | id=${JSON.stringify(row.id)} | player_id=${JSON.stringify(row.player_id)} | document_type=${JSON.stringify(row.document_type)} | storage_path=${JSON.stringify(row.storage_path)} | file_name=${JSON.stringify(row.file_name)} | bucket=${JSON.stringify(DOCUMENTS_BUCKET)}`,
    );
    try {
      const signed = await createSignedStorageUrl(
        DOCUMENTS_BUCKET,
        row.storage_path,
      );
      if (signed) url = signed;
    } catch (error) {
      // One missing/stale object must not fail the whole documents load/upload.
      // Flat string lines so the console never collapses details to `{}`.
      console.error(
        `[documents] ${context}:createSignedStorageUrl FAILED for player_documents row`,
      );
      console.error(`[documents]   id=${JSON.stringify(row.id)}`);
      console.error(
        `[documents]   document_type=${JSON.stringify(row.document_type)}`,
      );
      console.error(
        `[documents]   storage_path=${JSON.stringify(row.storage_path)}`,
      );
      console.error(
        `[documents]   player_id=${JSON.stringify(row.player_id)}`,
      );
      console.error(
        `[documents]   bucket=${JSON.stringify(DOCUMENTS_BUCKET)}`,
      );
      console.error(
        `[documents]   error.message=${JSON.stringify(error instanceof Error ? error.message : String(error))}`,
      );
      if (error instanceof Error && error.stack) {
        console.error(`[documents]   stack=${error.stack}`);
      }
    }
  }

  return {
    id: uiId,
    fileName: row.file_name ?? undefined,
    url,
    uploadedAt,
  };
}

async function queryDocumentRow(
  playerId: string,
  storageType: string,
): Promise<PlayerDocumentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_documents")
    .select(DOCUMENT_SELECT)
    .eq("player_id", playerId)
    .eq("document_type", storageType)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as PlayerDocumentRow | null) ?? null;
}

async function upsertDocumentRow(input: {
  playerId: string;
  storageType: string;
  fileName: string | null;
  storagePath: string | null;
  publicUrl: string | null;
}): Promise<PlayerDocumentRow> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("player_documents")
    .upsert(
      {
        player_id: input.playerId,
        document_type: input.storageType,
        file_name: input.fileName,
        storage_path: input.storagePath,
        public_url: input.publicUrl,
        updated_at: now,
      },
      { onConflict: "player_id,document_type" },
    )
    .select(DOCUMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PlayerDocumentRow;
}

/** Load all documents for the authenticated player. */
export async function getPlayerDocuments(): Promise<PlayerDocumentsState> {
  const { playerId } = await requireCurrentPlayer();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("player_documents")
    .select(DOCUMENT_SELECT)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  const state = getDefaultDocumentsState();
  for (const row of (data as PlayerDocumentRow[] | null) ?? []) {
    const mapped = await mapRowToUploaded(row, "getPlayerDocuments");
    if (mapped) {
      state[mapped.id] = mapped;
    }
  }
  return state;
}

/**
 * Upload (or replace) a file document via Supabase Storage, then upsert metadata.
 */
export async function uploadDocumentFile(
  documentType: DocumentTypeId,
  file: File,
): Promise<UploadedDocument> {
  const definition = DOCUMENT_DEFINITIONS.find((def) => def.id === documentType);
  if (!definition || definition.kind !== "file") {
    throw new Error("Unknown or non-file document type.");
  }

  const acceptImages = definition.accept?.includes("image/*") ?? true;
  assertDocumentFile(file, acceptImages);

  const { playerId } = await requireCurrentPlayer();
  const storageType = toStorageDocumentType(documentType);
  const existing = await queryDocumentRow(playerId, storageType);
  const previousPath = existing?.storage_path ?? null;

  const plannedPath = buildDocumentStoragePath(playerId, documentType, file);
  console.log(
    `[documents] uploadDocumentFile:beforeUpload | bucket=${JSON.stringify(DOCUMENTS_BUCKET)} | playerId=${JSON.stringify(playerId)} | documentType=${JSON.stringify(documentType)} | storageType=${JSON.stringify(storageType)} | plannedPath=${JSON.stringify(plannedPath)} | previousPath=${JSON.stringify(previousPath)} | fileName=${JSON.stringify(file.name)}`,
  );

  const uploaded = await uploadStorageObject({
    bucket: DOCUMENTS_BUCKET,
    path: plannedPath,
    file,
    upsert: true,
  });
  // Always persist the exact key returned by Storage (source of truth for signing).
  const storagePath = uploaded.storagePath;

  console.log(
    `[documents] uploadDocumentFile:afterUpload | bucket=${JSON.stringify(DOCUMENTS_BUCKET)} | plannedPath=${JSON.stringify(plannedPath)} | uploadResponsePath=${JSON.stringify(uploaded.uploadResponsePath)} | uploadResponseFullPath=${JSON.stringify(uploaded.uploadResponseFullPath)} | storagePathPersisted=${JSON.stringify(storagePath)} | plannedEqualsPersisted=${JSON.stringify(plannedPath === storagePath)}`,
  );

  if (previousPath && previousPath !== storagePath) {
    try {
      await removeStorageObject(DOCUMENTS_BUCKET, previousPath);
    } catch {
      // Best-effort cleanup of previous object.
    }
  }

  const row = await upsertDocumentRow({
    playerId,
    storageType,
    fileName: file.name,
    storagePath,
    publicUrl: null,
  });

  console.log(
    `[documents] uploadDocumentFile:afterDbUpsert | bucket=${JSON.stringify(DOCUMENTS_BUCKET)} | row.id=${JSON.stringify(row.id)} | row.player_id=${JSON.stringify(row.player_id)} | row.document_type=${JSON.stringify(row.document_type)} | row.storage_path=${JSON.stringify(row.storage_path)} | matchesUploadPath=${JSON.stringify(row.storage_path === storagePath)}`,
  );

  const mapped = await mapRowToUploaded(row, "uploadDocumentFile");
  if (!mapped) throw new Error("Failed to save document.");
  return mapped;
}

/** Save highlight video URL only (no Storage object). */
export async function saveDocumentUrl(
  documentType: DocumentTypeId,
  url: string,
): Promise<UploadedDocument> {
  const definition = DOCUMENT_DEFINITIONS.find((def) => def.id === documentType);
  if (!definition || definition.kind !== "url") {
    throw new Error("Unknown or non-URL document type.");
  }

  const trimmed = url.trim();
  if (!isValidHttpUrl(trimmed)) {
    throw new Error("Enter a valid http(s) URL.");
  }

  const { playerId } = await requireCurrentPlayer();
  const storageType = toStorageDocumentType(documentType);
  const existing = await queryDocumentRow(playerId, storageType);

  if (existing?.storage_path) {
    try {
      await removeStorageObject(DOCUMENTS_BUCKET, existing.storage_path);
    } catch {
      // Best-effort.
    }
  }

  const row = await upsertDocumentRow({
    playerId,
    storageType,
    fileName: null,
    storagePath: null,
    publicUrl: trimmed,
  });

  const mapped = await mapRowToUploaded(row, "saveDocumentUrl");
  if (!mapped) throw new Error("Failed to save URL.");
  return mapped;
}

/** Remove a document row and its Storage object. */
export async function deleteDocument(
  documentType: DocumentTypeId,
): Promise<void> {
  const { playerId } = await requireCurrentPlayer();
  const storageType = toStorageDocumentType(documentType);
  const existing = await queryDocumentRow(playerId, storageType);
  if (!existing) return;

  await removeStorageObject(DOCUMENTS_BUCKET, existing.storage_path);

  const supabase = await createClient();
  const { error } = await supabase
    .from("player_documents")
    .delete()
    .eq("id", existing.id);

  if (error) {
    throw new Error(error.message);
  }
}
