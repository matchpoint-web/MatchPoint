"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { PlayerCard } from "@/components/college/players/PlayerCard";
import { type Player } from "@/lib/player-service";
import { removeSavedPlayerAction } from "@/lib/saved-players/actions";

type SavedPlayersClientProps = {
  players: Player[];
  collegeId: string | null;
  initialSavedIds: string[];
  error?: string | null;
};

export function SavedPlayersClient({
  players,
  collegeId,
  initialSavedIds,
  error = null,
}: SavedPlayersClientProps) {
  const [savedIds, setSavedIds] = useState<string[]>(initialSavedIds);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSavedIds(initialSavedIds);
  }, [initialSavedIds]);

  const savedPlayers = useMemo(() => {
    const byId = new Map(players.map((player) => [player.id, player]));
    return savedIds
      .map((id) => byId.get(id))
      .filter((player): player is Player => Boolean(player));
  }, [players, savedIds]);

  function handleRemove(playerId: string) {
    if (!collegeId) return;

    const previous = savedIds;
    setSavedIds((prev) => prev.filter((id) => id !== playerId));

    startTransition(async () => {
      try {
        await removeSavedPlayerAction(playerId);
      } catch {
        setSavedIds(previous);
      }
    });
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
        <p className="text-lg font-medium text-zinc-300">
          Unable to load players
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Something went wrong while loading saved players. Please try again in
          a moment.
        </p>
      </div>
    );
  }

  if (savedPlayers.length === 0) {
    return (
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
    );
  }

  return (
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
  );
}
