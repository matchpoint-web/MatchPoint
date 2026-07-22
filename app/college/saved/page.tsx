import { Suspense } from "react";
import { PlayerSearchSkeleton } from "@/components/college/players/PlayerSearchSkeleton";
import { SavedPlayersClient } from "@/components/college/players/SavedPlayersClient";
import { requireApprovedCollege } from "@/lib/college-access";
import { getPlayersByIds } from "@/lib/player-service";
import {
  getCurrentCollegeId,
  getSavedPlayers,
} from "@/lib/saved-player-service";

async function SavedPlayersLoader() {
  await requireApprovedCollege();
  try {
    const collegeId = await getCurrentCollegeId();
    const saved = collegeId ? await getSavedPlayers(collegeId) : [];
    const savedIds = saved.map((entry) => entry.player_id);
    const players = await getPlayersByIds(savedIds);

    return (
      <SavedPlayersClient
        players={players}
        collegeId={collegeId}
        initialSavedIds={savedIds}
      />
    );
  } catch {
    return (
      <SavedPlayersClient
        players={[]}
        collegeId={null}
        initialSavedIds={[]}
        error="Unable to load players"
      />
    );
  }
}

export default function SavedPlayersPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Players your staff has bookmarked for recruiting follow-up.
        </p>
        <Suspense fallback={<PlayerSearchSkeleton />}>
          <SavedPlayersLoader />
        </Suspense>
      </div>
    </div>
  );
}
