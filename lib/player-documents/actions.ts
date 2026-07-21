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
}

export async function getPlayerDocumentsAction(): Promise<PlayerDocumentsState> {
  return getPlayerDocuments();
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
    console.log(
      `[documents] uploadDocumentFileAction:start | documentType=${JSON.stringify(documentType)} | fileName=${JSON.stringify(file.name)} | fileSize=${JSON.stringify(file.size)}`,
    );
    const document = await uploadDocumentFile(
      documentType as DocumentTypeId,
      file,
    );
    console.log(
      `[documents] uploadDocumentFileAction:uploadOk | documentType=${JSON.stringify(documentType)} | documentId=${JSON.stringify(document.id)} | fileName=${JSON.stringify(document.fileName)} | hasUrl=${JSON.stringify(Boolean(document.url))}`,
    );
    revalidateDocumentPages();
    // Refresh can sign every stored path; isolate failures with a clear step label.
    const documents = await getPlayerDocuments();
    console.log(
      `[documents] uploadDocumentFileAction:refreshOk | documentType=${JSON.stringify(documentType)} | keys=${JSON.stringify(Object.keys(documents))}`,
    );
    return { error: null, documents, document };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload document.";
    console.error(
      `[documents] uploadDocumentFileAction:error | documentType=${JSON.stringify(documentType)} | error.message=${JSON.stringify(message)} | stack=${JSON.stringify(error instanceof Error ? error.stack : undefined)}`,
    );
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
      error instanceof Error ? error.message : "Failed to save URL.";
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
