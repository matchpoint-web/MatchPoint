"use client";

import Link from "next/link";
import { type Player } from "@/lib/player-service";

type PlayerCardProps = {
  player: Player;
  saved: boolean;
  onToggleSave: (id: string) => void;
  /** `search` shows Save/Saved; `saved` shows Remove Player. */
  mode?: "search" | "saved";
};

function displayValue(value: string | null | undefined): string {
  if (value == null || value === "") return "Not provided";
  return value;
}

export function PlayerCard({
  player,
  saved,
  onToggleSave,
  mode = "search",
}: PlayerCardProps) {
  const isSavedMode = mode === "saved";

  const stats = [
    {
      label: "Graduation Year",
      value: displayValue(player.graduationYear || null),
    },
    {
      label: "UTR",
      value:
        player.utr != null ? player.utr.toFixed(1) : "Not provided",
    },
    {
      label: "GPA",
      value:
        player.gpa != null ? player.gpa.toFixed(1) : "Not provided",
    },
    {
      label: "Country",
      value: displayValue(player.country || null),
    },
  ];

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 transition-all duration-500 group-hover:from-emerald-500/5 group-hover:to-transparent" />

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-emerald-400/90"
            aria-label={
              player.profileImageUrl
                ? `${player.name} profile photo`
                : `${player.name} — no profile photo`
            }
          >
            {player.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.profileImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : player.initials ? (
              <span aria-hidden>{player.initials}</span>
            ) : (
              <span className="text-[10px] font-medium text-zinc-500">N/A</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-white">
              {player.name}
            </h3>
            <p className="text-sm text-zinc-500">
              {player.country
                ? `${player.country} ${player.countryFlag}`.trim()
                : "Country not provided"}
            </p>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
              <p
                className={`truncate text-xs font-medium ${
                  stat.value === "Not provided"
                    ? "text-zinc-500"
                    : "text-zinc-200"
                }`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/college/players/${player.id}`}
            className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-black transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => onToggleSave(player.id)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              isSavedMode
                ? "border-white/10 bg-white/5 text-zinc-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                : saved
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:border-emerald-500/30 hover:bg-white/10"
            }`}
          >
            {isSavedMode ? "Remove Player" : saved ? "Saved" : "Save Player"}
          </button>
        </div>
      </div>
    </article>
  );
}
