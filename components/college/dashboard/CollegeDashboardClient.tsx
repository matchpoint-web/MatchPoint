"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CollegeProfileAvatar } from "@/components/college/CollegeProfileAvatar";
import {
  getDashboardStats,
  getRecentSavedPlayers,
  toRecentPlayerRows,
  type DashboardStatCard,
  type RecentSavedPlayerRow,
} from "@/lib/dashboard";
import { type Player } from "@/lib/player-service";
import { useCollegeProfile } from "@/lib/use-college-profile";
import { type SavedPlayerRecord } from "@/lib/saved-player-service";

type DashboardData = {
  stats: DashboardStatCard[];
  recentSaved: RecentSavedPlayerRow[];
  recentViewed: RecentSavedPlayerRow[];
};

type CollegeDashboardClientProps = {
  players: Player[];
  savedRecords: SavedPlayerRecord[];
  savedPlayersCount: number;
  unreadMessages: number;
  playersCount: number;
  recentlyViewedCount: number;
  recentViewedPlayers: Player[];
};

function loadDashboardData(
  players: Player[],
  savedRecords: SavedPlayerRecord[],
  savedPlayersCount: number,
  unreadMessages: number,
  playersCount: number,
  recentlyViewedCount: number,
  recentViewedPlayers: Player[],
): DashboardData {
  return {
    stats: getDashboardStats({
      savedPlayersCount,
      unreadMessages,
      playersCount,
      recentlyViewedCount,
    }),
    recentSaved: getRecentSavedPlayers(players, savedRecords, 5),
    // Keep list length aligned with previous UI (5); data loaded up to 10 server-side.
    recentViewed: toRecentPlayerRows(recentViewedPlayers.slice(0, 5)),
  };
}

export function CollegeDashboardClient({
  players,
  savedRecords,
  savedPlayersCount,
  unreadMessages,
  playersCount,
  recentlyViewedCount,
  recentViewedPlayers,
}: CollegeDashboardClientProps) {
  const profile = useCollegeProfile();
  const [data, setData] = useState<DashboardData>({
    stats: [
      {
        title: "Saved Players",
        value: 0,
        href: "/college/saved",
        description: "Players bookmarked for recruiting",
      },
      {
        title: "Messages",
        value: 0,
        href: "/college/messages",
        description: "0 unread messages",
      },
      {
        title: "Player Search",
        value: 0,
        href: "/college/players",
        description: "Browse and discover recruits",
      },
      {
        title: "Recently Viewed",
        value: 0,
        href: "/college/players",
        description: "Player profiles you opened",
      },
    ],
    recentSaved: [],
    recentViewed: [],
  });

  useEffect(() => {
    setData(
      loadDashboardData(
        players,
        savedRecords,
        savedPlayersCount,
        unreadMessages,
        playersCount,
        recentlyViewedCount,
        recentViewedPlayers,
      ),
    );
  }, [
    players,
    savedRecords,
    savedPlayersCount,
    unreadMessages,
    playersCount,
    recentlyViewedCount,
    recentViewedPlayers,
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-emerald-400">
              Welcome back
            </p>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {profile.headCoach || "Head Coach"}
            </h2>
            <p className="text-sm text-zinc-500 sm:text-base">
              {profile.universityName}
            </p>
            {profile.ncaaDivision ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
                {profile.ncaaDivision}
                {profile.conference ? ` · ${profile.conference}` : ""}
              </p>
            ) : null}
          </div>
          <CollegeProfileAvatar profile={profile} size="md" />
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.stats.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5"
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                {card.title}
              </p>
              <p className="mb-2 text-3xl font-semibold tracking-tight text-white">
                {card.value}
              </p>
              <p className="text-sm leading-relaxed text-zinc-500">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-7">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Recent Saved Players
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Your five most recently saved players.
              </p>
            </div>
            <Link
              href="/college/saved"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>

          {data.recentSaved.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No saved players yet. Save players from Player Search.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.recentSaved.map(({ player }) => (
                <li key={player.id}>
                  <Link
                    href={`/college/players/${player.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3 transition hover:border-emerald-500/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 text-xs font-bold text-emerald-400">
                      {player.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {player.country} {player.countryFlag}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                        UTR
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {player.utr != null ? player.utr.toFixed(1) : "N/A"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-6 sm:p-7">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Recently Viewed
              </h3>
              <p className="mt-1 text-sm text-zinc-500">
                Player profiles you opened recently.
              </p>
            </div>
            <Link
              href="/college/players"
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
            >
              Search players
            </Link>
          </div>

          {data.recentViewed.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No recently viewed players yet. Open a profile from Player
                Search.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {data.recentViewed.map(({ player }) => (
                <li key={player.id}>
                  <Link
                    href={`/college/players/${player.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-3 transition hover:border-emerald-500/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 text-xs font-bold text-emerald-400">
                      {player.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {player.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {player.country} {player.countryFlag}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                        UTR
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {player.utr != null ? player.utr.toFixed(1) : "N/A"}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
