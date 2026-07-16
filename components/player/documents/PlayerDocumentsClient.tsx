"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toast } from "@/components/ui/Toast";
import { DocumentCard } from "./DocumentCard";
import { DocumentsCompletion } from "./DocumentsCompletion";
import { DocumentsEmptyState } from "./DocumentsEmptyState";
import {
  DOCUMENT_DEFINITIONS,
  getDocumentsCompletion,
  readPlayerDocuments,
  removePlayerDocument,
  type DocumentTypeId,
  type PlayerDocumentsState,
  upsertPlayerDocument,
} from "@/lib/player-documents";

type ToastState = {
  message: string | null;
  tone: "success" | "error";
};

export function PlayerDocumentsClient() {
  const [hydrated, setHydrated] = useState(false);
  const [documents, setDocuments] = useState<PlayerDocumentsState>({});
  const [toast, setToast] = useState<ToastState>({
    message: null,
    tone: "success",
  });
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDocuments(readPlayerDocuments());
    setHydrated(true);
  }, []);

  const completion = useMemo(
    () => getDocumentsCompletion(documents),
    [documents],
  );

  const dismissToast = useCallback(() => {
    setToast((prev) => ({ ...prev, message: null }));
  }, []);

  function showSuccess(message: string) {
    setToast({ message, tone: "success" });
  }

  function handleUploadFile(id: DocumentTypeId, file: File) {
    const next = upsertPlayerDocument(documents, {
      id,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
    });
    setDocuments(next);
    const title =
      DOCUMENT_DEFINITIONS.find((def) => def.id === id)?.title ?? "Document";
    showSuccess(`${title} uploaded successfully.`);
  }

  function handleUploadUrl(id: DocumentTypeId, url: string) {
    const next = upsertPlayerDocument(documents, {
      id,
      url,
      uploadedAt: new Date().toISOString(),
    });
    setDocuments(next);
    showSuccess("Highlight video URL saved successfully.");
  }

  function handleRemove(id: DocumentTypeId) {
    const title =
      DOCUMENT_DEFINITIONS.find((def) => def.id === id)?.title ?? "Document";
    const next = removePlayerDocument(documents, id);
    setDocuments(next);
    showSuccess(`${title} removed.`);
  }

  function scrollToCards() {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-3xl bg-white/[0.04]" />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-3xl bg-white/[0.04]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DocumentsCompletion
        percent={completion.percent}
        uploaded={completion.uploaded}
        total={completion.total}
        requiredUploaded={completion.requiredUploaded}
        requiredTotal={completion.requiredTotal}
      />

      {completion.uploaded === 0 ? (
        <DocumentsEmptyState onBrowse={scrollToCards} />
      ) : null}

      <div
        ref={gridRef}
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        {DOCUMENT_DEFINITIONS.map((definition) => (
          <DocumentCard
            key={definition.id}
            definition={definition}
            uploaded={documents[definition.id] ?? null}
            onUploadFile={(file) => handleUploadFile(definition.id, file)}
            onUploadUrl={(url) => handleUploadUrl(definition.id, url)}
            onRemove={() => handleRemove(definition.id)}
          />
        ))}
      </div>

      <Toast
        message={toast.message}
        tone={toast.tone}
        onDismiss={dismissToast}
      />
    </div>
  );
}
