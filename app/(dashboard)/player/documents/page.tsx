import { Suspense } from "react";
import { PlayerDocumentsClient } from "@/components/player/documents/PlayerDocumentsClient";
import { DocumentsGridSkeleton } from "@/components/routing/PageSkeletons";
import { getDefaultDocumentsState } from "@/lib/player-documents";
import { getPlayerDocuments } from "@/lib/player-documents-service";

async function PlayerDocumentsLoader() {
  let documents = getDefaultDocumentsState();
  try {
    documents = await getPlayerDocuments();
  } catch {
    documents = getDefaultDocumentsState();
  }

  return <PlayerDocumentsClient initialDocuments={documents} />;
}

export default function PlayerDocumentsPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Upload transcripts, test scores, your resume, and a highlight video
          link.
        </p>
        <Suspense fallback={<DocumentsGridSkeleton />}>
          <PlayerDocumentsLoader />
        </Suspense>
      </div>
    </div>
  );
}
