"use server";

import {
  defaultFilters,
  PLAYERS_PER_PAGE,
  type PlayerFilters,
  type SortOption,
} from "@/lib/players";
import {
  searchPlayers,
  type PlayerSearchResult,
} from "@/lib/player-search-service";

export type SearchPlayersActionInput = {
  query?: string;
  filters?: PlayerFilters;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

function isSortOption(value: unknown): value is SortOption {
  return (
    value === "highest-utr" ||
    value === "highest-gpa" ||
    value === "newest"
  );
}

function normalizeFilters(filters: PlayerFilters | undefined): PlayerFilters {
  if (!filters) return defaultFilters;
  return {
    country: typeof filters.country === "string" ? filters.country : "",
    graduationYear:
      typeof filters.graduationYear === "string" ? filters.graduationYear : "",
    utrRange: typeof filters.utrRange === "string" ? filters.utrRange : "",
    gpaRange: typeof filters.gpaRange === "string" ? filters.gpaRange : "",
    division: typeof filters.division === "string" ? filters.division : "",
    handedness:
      typeof filters.handedness === "string" ? filters.handedness : "",
    major: typeof filters.major === "string" ? filters.major : "",
    academicTest:
      typeof filters.academicTest === "string" ? filters.academicTest : "",
    heightRange:
      typeof filters.heightRange === "string" ? filters.heightRange : "",
  };
}

/**
 * Server action entry for College Player Search.
 * UI → Action → Service → Queries → Supabase
 */
export async function searchPlayersAction(
  input: SearchPlayersActionInput = {},
): Promise<PlayerSearchResult> {
  const page =
    typeof input.page === "number" && Number.isFinite(input.page)
      ? Math.max(1, Math.floor(input.page))
      : 1;
  const pageSize =
    typeof input.pageSize === "number" && Number.isFinite(input.pageSize)
      ? Math.max(1, Math.floor(input.pageSize))
      : PLAYERS_PER_PAGE;

  return searchPlayers({
    query: typeof input.query === "string" ? input.query : "",
    filters: normalizeFilters(input.filters),
    sort: isSortOption(input.sort) ? input.sort : "highest-utr",
    page,
    pageSize,
  });
}
