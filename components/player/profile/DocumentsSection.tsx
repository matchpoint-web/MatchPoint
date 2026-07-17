"use client";

import { PlayerDocumentsClient } from "@/components/player/documents/PlayerDocumentsClient";
import { type PlayerDocumentsState } from "@/lib/player-documents";

type DocumentsSectionProps = {
  initialDocuments: PlayerDocumentsState;
};

/**
 * Profile Documents section — same cards + upload flow as /player/documents.
 */
export function DocumentsSection({
  initialDocuments,
}: DocumentsSectionProps) {
  return (
    <PlayerDocumentsClient
      initialDocuments={initialDocuments}
      showOverview={false}
      gridClassName="grid gap-5 sm:grid-cols-2"
    />
  );
}
