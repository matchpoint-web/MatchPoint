"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  DOCUMENT_DEFINITIONS,
  getDocumentsCompletion,
  type DocumentTypeId,
  type PlayerDocumentsState,
} from "@/lib/player-documents";
import { uploadDocumentFileToStorage } from "@/lib/player-documents-browser";
import {
  deleteDocumentAction,
  saveDocumentMetadataAction,
} from "@/lib/player-documents/actions";

type ToastState = {
  message: string | null;
  tone: "success" | "error";
};

/**
 * Shared documents state + upload/remove handlers for Documents + Profile pages.
 * File binaries upload directly to Supabase Storage from the browser.
 */
export function usePlayerDocuments(initialDocuments: PlayerDocumentsState) {
  const [documents, setDocuments] =
    useState<PlayerDocumentsState>(initialDocuments);
  const [toast, setToast] = useState<ToastState>({
    message: null,
    tone: "success",
  });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setDocuments(initialDocuments);
  }, [initialDocuments]);

  const completion = useMemo(
    () => getDocumentsCompletion(documents),
    [documents],
  );

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: null }));
  }, []);

  const showToast = useCallback(
    (message: string, tone: "success" | "error") => {
      setToast({ message, tone });
    },
    [],
  );

  const uploadFile = useCallback(
    (id: DocumentTypeId, file: File) => {
      const title =
        DOCUMENT_DEFINITIONS.find((def) => def.id === id)?.title ?? "Document";

      startTransition(async () => {
        try {
          const { storagePath, fileName } = await uploadDocumentFileToStorage(
            id,
            file,
          );
          const result = await saveDocumentMetadataAction(id, {
            fileName,
            storagePath,
            publicUrl: null,
          });

          if (result.error || !result.documents) {
            showToast(result.error ?? "Upload failed.", "error");
            return;
          }

          setDocuments(result.documents);
          showToast(`${title} uploaded successfully.`, "success");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Upload failed.";
          showToast(message, "error");
        }
      });
    },
    [showToast],
  );

  const uploadUrl = useCallback(
    (id: DocumentTypeId, url: string) => {
      startTransition(async () => {
        const result = await saveDocumentMetadataAction(id, {
          fileName: null,
          storagePath: null,
          publicUrl: url,
        });

        if (result.error || !result.documents) {
          showToast(result.error ?? "Failed to save URL.", "error");
          return;
        }

        setDocuments(result.documents);
        showToast("Highlight video URL saved successfully.", "success");
      });
    },
    [showToast],
  );

  const remove = useCallback(
    (id: DocumentTypeId) => {
      const title =
        DOCUMENT_DEFINITIONS.find((def) => def.id === id)?.title ?? "Document";

      startTransition(async () => {
        const result = await deleteDocumentAction(id);
        if (result.error || !result.documents) {
          showToast(result.error ?? "Failed to remove document.", "error");
          return;
        }
        setDocuments(result.documents);
        showToast(`${title} removed.`, "success");
      });
    },
    [showToast],
  );

  return {
    documents,
    completion,
    toast,
    dismissToast,
    isPending,
    uploadFile,
    uploadUrl,
    remove,
  };
}
