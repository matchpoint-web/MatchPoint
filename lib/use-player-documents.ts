"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  DOCUMENT_DEFINITIONS,
  getDocumentsCompletion,
  type DocumentTypeId,
  type PlayerDocumentsState,
} from "@/lib/player-documents";
import {
  deleteDocumentAction,
  saveDocumentUrlAction,
  uploadDocumentFileAction,
} from "@/lib/player-documents/actions";

type ToastState = {
  message: string | null;
  tone: "success" | "error";
};

/**
 * Shared documents state + upload/remove handlers for Documents + Profile pages.
 * File binaries upload through Server Actions → service → Storage.
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
        const formData = new FormData();
        formData.set("file", file);
        const result = await uploadDocumentFileAction(id, formData);

        if (result.error || !result.documents) {
          showToast(result.error ?? "Upload failed.", "error");
          return;
        }

        setDocuments(result.documents);
        showToast(`${title} uploaded successfully.`, "success");
      });
    },
    [showToast],
  );

  const uploadUrl = useCallback(
    (id: DocumentTypeId, url: string) => {
      startTransition(async () => {
        const result = await saveDocumentUrlAction(id, url);

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
