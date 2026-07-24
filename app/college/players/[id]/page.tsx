import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CollegeHighlightVideo } from "@/components/college/players/profile/CollegeHighlightVideo";
import { CollegePlayerDocuments } from "@/components/college/players/profile/CollegePlayerDocuments";
import { CollegeProfileView } from "@/components/college/players/profile/CollegeProfileView";
import { GlassCard } from "@/components/player/GlassCard";
import { requireApprovedCollege } from "@/lib/college-access";
import { getPlayerDocumentsForCollege } from "@/lib/college-player-documents-service";
import { getCoachNote } from "@/lib/coach-notes-service";
import { getCollegePlayerProfile } from "@/lib/college-player-profile-service";
import {
  getCurrentCollegeId,
  isPlayerSaved,
} from "@/lib/saved-player-service";
import type { PlayerDocumentsState } from "@/lib/player-documents";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function CollegePlayerMediaSection({ playerId }: { playerId: string }) {
  let documents: PlayerDocumentsState | null = null;
  let error: string | null = null;

  try {
    documents = await getPlayerDocumentsForCollege(playerId);
  } catch (err) {
    error =
      err instanceof Error ? err.message : "Failed to load player documents.";
  }

  const highlightUrl = documents?.["highlight-video"]?.url ?? null;
  const documentsForList: PlayerDocumentsState | null = documents
    ? Object.fromEntries(
        Object.entries(documents).filter(([key]) => key !== "highlight-video"),
      )
    : null;

  return (
    <div className="space-y-8">
      <CollegeHighlightVideo url={highlightUrl} />
      <CollegePlayerDocuments
        playerId={playerId}
        initialDocuments={documentsForList}
        initialError={error}
      />
    </div>
  );
}

function DocumentsLoading() {
  return (
    <GlassCard className="p-6 sm:p-8">
      <p className="text-sm text-zinc-500">Loading documents…</p>
    </GlassCard>
  );
}

export default async function CollegePlayerProfilePage({ params }: PageProps) {
  await requireApprovedCollege();
  const { id } = await params;

  let profile;
  try {
    profile = await getCollegePlayerProfile(id);
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  let collegeId: string | null = null;
  let initiallySaved = false;
  let initialCoachNote = null;

  try {
    collegeId = await getCurrentCollegeId();
    if (collegeId) {
      const [saved, note] = await Promise.all([
        isPlayerSaved(collegeId, id),
        getCoachNote(id),
      ]);
      initiallySaved = saved;
      initialCoachNote = note;
    }
  } catch {
    collegeId = null;
    initiallySaved = false;
    initialCoachNote = null;
  }

  return (
    <CollegeProfileView
      profile={profile}
      collegeId={collegeId}
      initiallySaved={initiallySaved}
      initialCoachNote={initialCoachNote}
      documentsSlot={
        <Suspense fallback={<DocumentsLoading />}>
          <CollegePlayerMediaSection playerId={id} />
        </Suspense>
      }
    />
  );
}
