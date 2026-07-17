"use client";

import { useRef } from "react";
import { Toast } from "@/components/ui/Toast";
import { DocumentCard } from "./DocumentCard";
import { DocumentsCompletion } from "./DocumentsCompletion";
import { DocumentsEmptyState } from "./DocumentsEmptyState";
import { DOCUMENT_DEFINITIONS } from "@/lib/player-documents";
import { type PlayerDocumentsState } from "@/lib/player-documents";
import { usePlayerDocuments } from "@/lib/use-player-documents";

type PlayerDocumentsClientProps = {
  initialDocuments: PlayerDocumentsState;
  /** When false, hides completion bar + empty state (e.g. profile embed). */
  showOverview?: boolean;
  gridClassName?: string;
};

export function PlayerDocumentsClient({
  initialDocuments,
  showOverview = true,
  gridClassName = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
}: PlayerDocumentsClientProps) {
  const {
    documents,
    completion,
    toast,
    dismissToast,
    uploadFile,
    uploadUrl,
    remove,
  } = usePlayerDocuments(initialDocuments);
  const gridRef = useRef<HTMLDivElement>(null);

  function scrollToCards() {
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-6">
      {showOverview ? (
        <>
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
        </>
      ) : null}

      <div ref={gridRef} className={gridClassName}>
        {DOCUMENT_DEFINITIONS.map((definition) => (
          <DocumentCard
            key={definition.id}
            definition={definition}
            uploaded={documents[definition.id] ?? null}
            onUploadFile={(file) => uploadFile(definition.id, file)}
            onUploadUrl={(url) => uploadUrl(definition.id, url)}
            onRemove={() => remove(definition.id)}
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
