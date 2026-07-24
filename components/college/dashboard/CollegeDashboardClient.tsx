import Link from "next/link";
import { CollegeProfileAvatar } from "@/components/college/CollegeProfileAvatar";
import {
  getDashboardStats,
  getRecentSavedPlayers,
} from "@/lib/dashboard";
import type { CollegeProfile } from "@/lib/college-profile";
import { type Player } from "@/lib/player-service";
import { type SavedPlayerRecord } from "@/lib/saved-player-service";

type CollegeDashboardClientProps = {
  profile: CollegeProfile;
  players: Player[];
  savedRecords: SavedPlayerRecord[];
  savedPlayersCount: number;
  unreadMessages: number;
  playersCount: number;
};

/**
 * College dashboard body — server-rendered from props (no client state).
 * Avoids SSR/client default mismatches from deferred useEffect hydration.
 */
export function CollegeDashboardClient({
  profile,
  players,
  savedRecords,
  savedPlayersCount,
  unreadMessages,
  playersCount,
}: CollegeDashboardClientProps) {
  const stats = getDashboardStats({
    savedPlayersCount,
    unreadMessages,
    playersCount,
  });
  const recentSaved = getRecentSavedPlayers(players, savedRecords, 5);

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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((card) => (
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

      <section>
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

          {recentSaved.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-10 text-center">
              <p className="text-sm text-zinc-500">
                No saved players yet. Save players from Player Search.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentSaved.map(({ player }) => (
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
