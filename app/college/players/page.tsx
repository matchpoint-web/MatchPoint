import { Suspense } from "react";
import { PlayerSearchClient } from "@/components/college/players/PlayerSearchClient";
import { PlayerSearchSkeleton } from "@/components/college/players/PlayerSearchSkeleton";
import { getPlayers } from "@/lib/player-service";
import {
  getCurrentCollegeId,
  getSavedPlayers,
} from "@/lib/saved-player-service";

async function PlayerSearchLoader() {
  try {
    const [players, collegeId] = await Promise.all([
      getPlayers(),
      getCurrentCollegeId(),
    ]);

    const saved = collegeId ? await getSavedPlayers(collegeId) : [];

    return (
      <PlayerSearchClient
        players={players}
        collegeId={collegeId}
        initialSavedIds={saved.map((entry) => entry.player_id)}
      />
    );
  } catch {
    return (
      <PlayerSearchClient
        players={[]}
        collegeId={null}
        initialSavedIds={[]}
        error="Unable to load players"
      />
    );
  }
}

export default function PlayerSearchPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Discover tennis players from around the world.
        </p>
        <Suspense fallback={<PlayerSearchSkeleton />}>
          <PlayerSearchLoader />
        </Suspense>
      </div>
    </div>
  );
}
