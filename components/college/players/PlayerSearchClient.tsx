"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { PlayerCard } from "./PlayerCard";
import { PlayerSearchFilters } from "./PlayerSearchFilters";
import {
  defaultFilters,
  sortOptions,
  type PlayerFilters,
  type SortOption,
} from "@/lib/players";
import { type Player } from "@/lib/player-service";
import {
  searchPlayersAction,
} from "@/lib/players/search-actions";
import type { PlayerSearchResult } from "@/lib/player-search-service";
import { toggleSavedPlayerAction } from "@/lib/saved-players/actions";

type PlayerSearchClientProps = {
  initialResult: PlayerSearchResult;
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

export function PlayerSearchClient({
  initialResult,
  collegeId,
  initialSavedIds,
  error = null,
}: PlayerSearchClientProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<PlayerFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("highest-utr");
  const [page, setPage] = useState(initialResult.page);
  const [result, setResult] = useState<PlayerSearchResult>(initialResult);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(initialSavedIds),
  );
  const [isPending, startTransition] = useTransition();
  const requestIdRef = useRef(0);

  useEffect(() => {
    setSavedIds(new Set(initialSavedIds));
  }, [initialSavedIds]);

  const runSearch = useCallback(
    (next: {
      query: string;
      filters: PlayerFilters;
      sort: SortOption;
      page: number;
    }) => {
      const requestId = ++requestIdRef.current;
      startTransition(async () => {
        try {
          const nextResult = await searchPlayersAction({
            query: next.query,
            filters: next.filters,
            sort: next.sort,
            page: next.page,
          });
          if (requestId !== requestIdRef.current) return;
          setResult(nextResult);
          setPage(nextResult.page);
        } catch {
          if (requestId !== requestIdRef.current) return;
          setResult({
            players: [],
            totalCount: 0,
            page: 1,
            pageSize: initialResult.pageSize,
            totalPages: 1,
          });
        }
      });
    },
    [initialResult.pageSize],
  );

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(1);
    runSearch({ query: value, filters, sort, page: 1 });
  }

  function handleFiltersChange(next: PlayerFilters) {
    setFilters(next);
    setPage(1);
    runSearch({ query, filters: next, sort, page: 1 });
  }

  function handleSortChange(value: SortOption) {
    setSort(value);
    setPage(1);
    runSearch({ query, filters, sort: value, page: 1 });
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    runSearch({ query, filters, sort, page: nextPage });
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

  const { players, totalCount, totalPages } = result;
  const currentPage = Math.min(page, totalPages);

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
          <span className="font-medium text-zinc-300">{totalCount}</span>{" "}
          {totalCount === 1 ? "player" : "players"} found
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

      {players.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player: Player) => (
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
            disabled={currentPage === 1 || isPending}
            onClick={() => handlePageChange(currentPage - 1)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              disabled={isPending}
              onClick={() => handlePageChange(p)}
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
            disabled={currentPage === totalPages || isPending}
            onClick={() => handlePageChange(currentPage + 1)}
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-400 transition-all hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
