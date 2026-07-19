"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { PlayerCard } from "./PlayerCard";
import { PlayerSearchFilters } from "./PlayerSearchFilters";
import {
  defaultFilters,
  matchesCountryFilter,
  matchesGpaRange,
  matchesGraduationYearFilter,
  matchesUtrRange,
  PLAYERS_PER_PAGE,
  sortOptions,
  type PlayerFilters,
  type SortOption,
} from "@/lib/players";
import { type Player } from "@/lib/player-service";
import { toggleSavedPlayerAction } from "@/lib/saved-players/actions";

type PlayerSearchClientProps = {
  players: Player[];
  collegeId: string | null;
  initialSavedIds: string[];
  error?: string | null;
};

function countActiveFilters(filters: PlayerFilters): number {
  let count = 0;
  if (filters.country) count++;
  if (filters.graduationYear) count++;
  if (filters.utrRange) count++;
  if (filters.gpaRange) count++;
  return count;
}

function filterPlayers(
  players: Player[],
  query: string,
  filters: PlayerFilters,
) {
  const q = query.trim().toLowerCase();

  return players.filter((player) => {
    if (q && !player.name.toLowerCase().includes(q)) return false;
    if (!matchesCountryFilter(player.country, filters.country)) return false;
    if (
      !matchesGraduationYearFilter(
        player.graduationYear,
        filters.graduationYear,
      )
    ) {
      return false;
    }
    if (!matchesUtrRange(player.utr, filters.utrRange)) return false;
    if (!matchesGpaRange(player.gpa, filters.gpaRange)) return false;
    return true;
  });
}

function sortPlayers(players: Player[], sort: SortOption) {
  const sorted = [...players];
  switch (sort) {
    case "highest-gpa":
      return sorted.sort((a, b) => b.gpa - a.gpa);
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "highest-utr":
    default:
      return sorted.sort((a, b) => b.utr - a.utr);
  }
}

export function PlayerSearchClient({
  players,
  collegeId,
  initialSavedIds,
  error = null,
}: PlayerSearchClientProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<PlayerFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("highest-utr");
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(initialSavedIds),
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    setSavedIds(new Set(initialSavedIds));
  }, [initialSavedIds]);

  const filtered = useMemo(
    () => sortPlayers(filterPlayers(players, query, filters), sort),
    [players, query, filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PLAYERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PLAYERS_PER_PAGE,
    currentPage * PLAYERS_PER_PAGE,
  );

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFiltersChange(next: PlayerFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
  }

  function handleToggleSave(id: string) {
    if (!collegeId) return;

    const previouslySaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (previouslySaved) next.delete(id);
      else next.add(id);
      return next;
    });

    startTransition(async () => {
      try {
        const saved = await toggleSavedPlayerAction(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (saved) next.add(id);
          else next.delete(id);
          return next;
        });
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (previouslySaved) next.add(id);
          else next.delete(id);
          return next;
        });
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
          Something went wrong while loading player profiles. Please try again
          in a moment.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="relative mb-6">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search by player name..."
          className="w-full rounded-3xl border border-white/10 bg-zinc-900 py-4 pl-14 pr-5 text-base text-white outline-none transition-all placeholder:text-zinc-500 focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
        />
      </div>

      <div className="mb-8">
        <PlayerSearchFilters
          filters={filters}
          onChange={handleFiltersChange}
          onClear={() => handleFiltersChange(defaultFilters)}
          activeCount={countActiveFilters(filters)}
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500">
          <span className="font-medium text-zinc-300">{filtered.length}</span>{" "}
          {filtered.length === 1 ? "player" : "players"} found
        </p>

        <div className="flex items-center gap-3">
          <label
            htmlFor="sort"
            className="text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="rounded-2xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 outline-none transition-colors focus:border-emerald-500/40"
            style={{ colorScheme: "dark" }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-zinc-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginated.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              saved={savedIds.has(player.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
          <p className="text-lg font-medium text-zinc-400">No players found.</p>
          <p className="mt-2 text-sm text-zinc-600">
            Try adjusting your search or filters.
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-medium transition-all ${
                p === currentPage
                  ? "bg-emerald-500 text-black"
                  : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08]"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
