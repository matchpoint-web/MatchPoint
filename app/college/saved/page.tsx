"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlayerCard } from "@/components/college/players/PlayerCard";
import { mockPlayers } from "@/lib/mock-players";
import {
  getSavedPlayerIds,
  removeSavedPlayer,
} from "@/lib/saved-players";

export default function SavedPlayersPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedPlayerIds());
  }, []);

  const savedPlayers = useMemo(() => {
    const byId = new Map(mockPlayers.map((player) => [player.id, player]));
    return savedIds
      .map((id) => byId.get(id))
      .filter((player): player is NonNullable<typeof player> => Boolean(player));
  }, [savedIds]);

  function handleRemove(playerId: string) {
    removeSavedPlayer(playerId);
    setSavedIds((prev) => prev.filter((id) => id !== playerId));
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Players your staff has bookmarked for recruiting follow-up.
        </p>

        {savedPlayers.length === 0 ? (
          <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              No Saved Players
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-zinc-500 sm:text-base">
              Save players from Player Search to review them later.
            </p>
            <Link
              href="/college/players"
              className="mt-8 inline-flex rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Go to Player Search
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {savedPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                saved
                mode="saved"
                onToggleSave={handleRemove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
