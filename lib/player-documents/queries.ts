import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import {
  DOCUMENT_DEFINITIONS,
  getDefaultDocumentsState,
  toUiDocumentType,
  type PlayerDocumentsState,
  type UploadedDocument,
} from "@/lib/player-documents";
import {
  createSignedStorageUrl,
  DOCUMENTS_BUCKET,
} from "@/lib/storage/queries";

export type PlayerDocumentRow = Tables<"player_documents">;

/** Server-only select — includes storage_path for signing; never return this row to clients. */
export const PLAYER_DOCUMENT_SELECT =
  "id, player_id, document_type, file_name, storage_path, public_url, created_at, updated_at" as const;

/** Load raw document rows for a player. RLS enforces player-own or college-read. */
export async function queryDocumentsForPlayer(
  playerId: string,
): Promise<PlayerDocumentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_documents")
    .select(PLAYER_DOCUMENT_SELECT)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  return (data as PlayerDocumentRow[] | null) ?? [];
}

/**
 * Map DB rows → UI state with signed URLs.
 * Output never includes storage_path — only id, fileName, url, uploadedAt.
 */
export async function mapDocumentRowsToState(
  rows: PlayerDocumentRow[],
  context: string,
): Promise<PlayerDocumentsState> {
  const state = getDefaultDocumentsState();

  const mapped = await Promise.all(
    rows.map((row) => mapDocumentRowToUploaded(row, context)),
  );

  for (const doc of mapped) {
    if (doc) {
      state[doc.id] = doc;
    }
  }

  return state;
}

export async function mapDocumentRowToUploaded(
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
    try {
      const signed = await createSignedStorageUrl(
        DOCUMENTS_BUCKET,
        row.storage_path,
      );
      if (signed) url = signed;
    } catch (error) {
      console.error(
        `[documents] ${context}:createSignedStorageUrl FAILED | id=${JSON.stringify(row.id)} | document_type=${JSON.stringify(row.document_type)} | player_id=${JSON.stringify(row.player_id)} | error.message=${JSON.stringify(error instanceof Error ? error.message : String(error))}`,
      );
    }
  }

  return {
    id: uiId,
    fileName: row.file_name ?? undefined,
    url,
    uploadedAt,
  };
}
