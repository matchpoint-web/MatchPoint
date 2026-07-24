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
  saveDocumentUrl,
  uploadDocumentFile,
} from "@/lib/player-documents-service";

export type DocumentActionResult = {
  error: string | null;
  documents: PlayerDocumentsState | null;
  document: UploadedDocument | null;
};

function revalidateDocumentPages() {
  revalidatePath("/player/documents");
  revalidatePath("/player/profile");
  revalidatePath("/player");
  revalidatePath("/college/players");
}

/** Upload or replace a file document through the server (Storage + DB). */
export async function uploadDocumentFileAction(
  documentType: string,
  formData: FormData,
): Promise<DocumentActionResult> {
  if (!isDocumentTypeId(documentType)) {
    return { error: "Invalid document type.", documents: null, document: null };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size <= 0) {
    return { error: "A file is required.", documents: null, document: null };
  }

  try {
    const document = await uploadDocumentFile(
      documentType as DocumentTypeId,
      file,
    );
    revalidateDocumentPages();
    const documents = await getPlayerDocuments();
    return { error: null, documents, document };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload document.";
    return { error: message, documents: null, document: null };
  }
}

/** Save a highlight video URL (no Storage upload). */
export async function saveDocumentUrlAction(
  documentType: string,
  url: string,
): Promise<DocumentActionResult> {
  if (!isDocumentTypeId(documentType)) {
    return { error: "Invalid document type.", documents: null, document: null };
  }

  try {
    const document = await saveDocumentUrl(
      documentType as DocumentTypeId,
      url,
    );
    revalidateDocumentPages();
    const documents = await getPlayerDocuments();
    return { error: null, documents, document };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save document URL.";
    return { error: message, documents: null, document: null };
  }
}

/** Delete a document (DB row + Storage object when present). */
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
