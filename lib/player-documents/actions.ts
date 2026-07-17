"use server";

import { revalidatePath } from "next/cache";
import {
  isDocumentTypeId,
  type DocumentTypeId,
  type PlayerDocumentsState,
  type UploadedDocument,
} from "@/lib/player-documents";
import {
  deleteDocument,
  getPlayerDocuments,
  saveDocumentMetadata,
  type DocumentMetadataInput,
} from "@/lib/player-documents-service";

export type DocumentActionResult = {
  error: string | null;
  documents: PlayerDocumentsState | null;
  document: UploadedDocument | null;
};

function revalidateDocumentPages() {
  revalidatePath("/player/documents");
  revalidatePath("/player/profile");
}

export async function getPlayerDocumentsAction(): Promise<PlayerDocumentsState> {
  return getPlayerDocuments();
}

/** Save metadata after a direct browser Storage upload, or save a highlight URL. */
export async function saveDocumentMetadataAction(
  documentType: string,
  metadata: DocumentMetadataInput,
): Promise<DocumentActionResult> {
  if (!isDocumentTypeId(documentType)) {
    return { error: "Invalid document type.", documents: null, document: null };
  }

  try {
    const document = await saveDocumentMetadata(
      documentType as DocumentTypeId,
      metadata,
    );
    revalidateDocumentPages();
    const documents = await getPlayerDocuments();
    return { error: null, documents, document };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save document.";
    return { error: message, documents: null, document: null };
  }
}

export async function deleteDocumentAction(
  documentType: string,
): Promise<DocumentActionResult> {
  if (!isDocumentTypeId(documentType)) {
    return { error: "Invalid document type.", documents: null, document: null };
  }

  try {
    await deleteDocument(documentType as DocumentTypeId);
    revalidateDocumentPages();
    const documents = await getPlayerDocuments();
    return { error: null, documents, document: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete document.";
    return { error: message, documents: null, document: null };
  }
}
