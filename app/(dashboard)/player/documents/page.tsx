import { Suspense } from "react";
import { PlayerDocumentsClient } from "@/components/player/documents/PlayerDocumentsClient";
import { getDefaultDocumentsState } from "@/lib/player-documents";
import { getPlayerDocuments } from "@/lib/player-documents-service";

function DocumentsSkeleton() {
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
        <Suspense fallback={<DocumentsSkeleton />}>
          <PlayerDocumentsLoader />
        </Suspense>
      </div>
    </div>
  );
}
