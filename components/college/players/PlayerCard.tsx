"use client";

import Link from "next/link";
import { type MockPlayer } from "@/lib/mock-players";

type PlayerCardProps = {
  player: MockPlayer;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

export function PlayerCard({
  player,
  saved,
  onToggleSave,
}: PlayerCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 transition-all duration-500 group-hover:from-emerald-500/5 group-hover:to-transparent" />

      <div className="relative p-5 sm:p-6">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-emerald-400/80">
            {player.initials}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold tracking-tight text-white">
              {player.name}
            </h3>
            <p className="text-sm text-zinc-500">
              {player.country} {player.countryFlag}
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          {[
            { label: "Grad Year", value: player.graduationYear },
            { label: "UTR", value: player.utr.toFixed(1) },
            { label: "GPA", value: player.gpa.toFixed(1) },
            { label: "Division", value: player.division },
            { label: "Style", value: player.playingStyle },
            { label: "Hand", value: player.handedness },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                {stat.label}
              </p>
              <p className="truncate text-xs font-medium text-zinc-200">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Highlight thumbnail */}
        <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-800 to-zinc-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.1)_0%,_transparent_70%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
              <svg
                className="ml-0.5 h-4 w-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium text-zinc-400 backdrop-blur-sm">
            Highlight
          </span>
        </div>

        <div className="flex gap-2">
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
              saved
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : "border-white/10 bg-white/5 text-zinc-300 hover:border-emerald-500/30 hover:bg-white/10"
            }`}
          >
            {saved ? "Saved" : "Save Player"}
          </button>
        </div>
      </div>
    </article>
  );
}
