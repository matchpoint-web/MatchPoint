"use client";

import { useMemo, useState, useTransition } from "react";
import { CollegeCard } from "./CollegeCard";
import { CollegeSearchFilters } from "./CollegeSearchFilters";
import {
  COLLEGES_PER_PAGE,
  collegeSortOptions,
  defaultCollegeFilters,
  filterColleges,
  sortColleges,
  type College,
  type CollegeFilters,
  type CollegeSortOption,
} from "@/lib/colleges";
import { toggleSavedCollegeAction } from "@/lib/saved-colleges/actions";

type CollegeSearchClientProps = {
  initialColleges: College[];
  initialSavedIds?: string[];
};

function countActiveFilters(filters: CollegeFilters): number {
  return filters.division ? 1 : 0;
}

export function CollegeSearchClient({
  initialColleges,
  initialSavedIds = [],
}: CollegeSearchClientProps) {
  const [colleges] = useState(initialColleges);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CollegeFilters>(defaultCollegeFilters);
  const [sort, setSort] = useState<CollegeSortOption>("name-asc");
  const [page, setPage] = useState(1);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(initialSavedIds),
  );
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(
    () => sortColleges(filterColleges(colleges, query, filters), sort),
    [colleges, query, filters, sort],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / COLLEGES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * COLLEGES_PER_PAGE,
    currentPage * COLLEGES_PER_PAGE,
  );
  const activeFilterCount = countActiveFilters(filters);

  function handleSearchChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  function handleFiltersChange(next: CollegeFilters) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(value: CollegeSortOption) {
    setSort(value);
    setPage(1);
  }

  function toggleSave(id: string) {
    const previouslySaved = savedIds.has(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (previouslySaved) next.delete(id);
      else next.add(id);
      return next;
    });

    startTransition(async () => {
      try {
        const nowSaved = await toggleSavedCollegeAction(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (nowSaved) next.add(id);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="college-search"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Search
          </label>
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
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
              id="college-search"
              type="search"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by university, city, or state…"
              className="w-full rounded-2xl border border-white/10 bg-zinc-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div className="w-full lg:w-56">
          <label
            htmlFor="college-sort"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
          >
            Sort
          </label>
          <select
            id="college-sort"
            value={sort}
            onChange={(e) =>
              handleSortChange(e.target.value as CollegeSortOption)
            }
            className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-3 py-3 text-sm text-zinc-200 outline-none transition-colors hover:border-white/15 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20"
            style={{ colorScheme: "dark" }}
          >
            {collegeSortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-zinc-900 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <CollegeSearchFilters
        filters={filters}
        onChange={handleFiltersChange}
        onClear={() => handleFiltersChange(defaultCollegeFilters)}
        activeCount={activeFilterCount}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {filtered.length} college{filtered.length === 1 ? "" : "s"} found
          {isPending ? " · Saving…" : ""}
        </p>
      </div>

      {paginated.length === 0 ? (
        <div className="rounded-3xl border border-white/8 bg-zinc-900/50 px-6 py-16 text-center">
          <p className="text-base font-medium text-zinc-300">No colleges found</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((college) => (
            <CollegeCard
              key={college.id}
              college={college}
              saved={savedIds.has(college.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-zinc-500">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
