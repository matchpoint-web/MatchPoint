"use client";

import { useState } from "react";
import { type FavoriteCollege } from "@/lib/player-profile";
import { GlassCard } from "../GlassCard";

type FavoriteCollegesProps = {
  colleges: FavoriteCollege[];
};

export function FavoriteColleges({ colleges }: FavoriteCollegesProps) {
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(colleges.map((c) => c.id)),
  );

  function toggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {colleges.map((college) => {
        const isFavorite = favorites.has(college.id);
        return (
          <GlassCard key={college.id} hover className="p-5 sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-zinc-400">
                {college.initials}
              </div>
              <button
                type="button"
                aria-label={`${isFavorite ? "Remove" : "Add"} ${college.name} from favorites`}
                onClick={() => toggleFavorite(college.id)}
                className={`rounded-xl p-2 transition-all duration-300 ${
                  isFavorite
                    ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill={isFavorite ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                  />
                </svg>
              </button>
            </div>
            <h3 className="mb-1 text-lg font-semibold tracking-tight text-white">
              {college.name}
            </h3>
            <p className="mb-3 text-sm text-zinc-500">{college.location}</p>
            <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              {college.division}
            </span>
          </GlassCard>
        );
      })}
    </div>
  );
}
