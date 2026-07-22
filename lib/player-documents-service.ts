import { requirePlayer } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { ensureCurrentPlayerId } from "@/lib/players/queries";
import {
  DOCUMENT_DEFINITIONS,
  isValidHttpUrl,
  toStorageDocumentType,
  type DocumentTypeId,
  type PlayerDocumentsState,
  type UploadedDocument,
} from "@/lib/player-documents";
import {
  mapDocumentRowToUploaded,
  mapDocumentRowsToState,
  PLAYER_DOCUMENT_SELECT,
  queryDocumentsForPlayer,
  type PlayerDocumentRow,
} from "@/lib/player-documents/queries";
import {
  assertDocumentFile,
  buildDocumentStoragePath,
  DOCUMENTS_BUCKET,
  removeStorageObject,
  uploadStorageObject,
} from "@/lib/storage/queries";

async function requireCurrentPlayer(): Promise<{
  userId: string;
  playerId: string;
}> {
  const user = await requirePlayer();
  const playerId = await ensureCurrentPlayerId();
  return { userId: user.id, playerId };
}

async function queryDocumentRow(
  playerId: string,
  storageType: string,
): Promise<PlayerDocumentRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_documents")
    .select(PLAYER_DOCUMENT_SELECT)
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
    .select(PLAYER_DOCUMENT_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as PlayerDocumentRow;
}

/** Load all documents for the authenticated player. */
export async function getPlayerDocuments(): Promise<PlayerDocumentsState> {
  const { playerId } = await requireCurrentPlayer();
  const rows = await queryDocumentsForPlayer(playerId);
  return mapDocumentRowsToState(rows, "getPlayerDocuments");
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

  const uploaded = await uploadStorageObject({
    bucket: DOCUMENTS_BUCKET,
    path: plannedPath,
    file,
    upsert: true,
  });
  const storagePath = uploaded.storagePath;

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

  const mapped = await mapDocumentRowToUploaded(row, "uploadDocumentFile");
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

  const mapped = await mapDocumentRowToUploaded(row, "saveDocumentUrl");
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
