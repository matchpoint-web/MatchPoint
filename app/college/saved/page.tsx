import { Suspense } from "react";
import { PlayerSearchSkeleton } from "@/components/college/players/PlayerSearchSkeleton";
import { SavedPlayersClient } from "@/components/college/players/SavedPlayersClient";
import { getPlayers } from "@/lib/player-service";
import {
  getCurrentCollegeId,
  getSavedPlayers,
} from "@/lib/saved-player-service";

async function SavedPlayersLoader() {
  try {
    const [players, collegeId] = await Promise.all([
      getPlayers(),
      getCurrentCollegeId(),
    ]);
    const saved = collegeId ? await getSavedPlayers(collegeId) : [];

    return (
      <SavedPlayersClient
        players={players}
        collegeId={collegeId}
        initialSavedIds={saved.map((entry) => entry.player_id)}
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
