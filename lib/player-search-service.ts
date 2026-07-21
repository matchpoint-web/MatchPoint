import type { Player } from "@/lib/players";
import {
  defaultFilters,
  PLAYERS_PER_PAGE,
  type PlayerFilters,
  type SortOption,
} from "@/lib/players";
import {
  mapPlayerSearchRowToPlayer,
  type PlayerDetail,
} from "@/lib/player-service";
import {
  queryPlayersPage,
  type PlayerSearchQueryInput,
} from "@/lib/players/search-queries";

export type PlayerSearchParams = {
  query?: string;
  filters?: PlayerFilters;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

export type PlayerSearchResult = {
  players: Player[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function normalizeSearchInput(
  params: PlayerSearchParams = {},
): PlayerSearchQueryInput {
  return {
    query: params.query ?? "",
    filters: params.filters ?? defaultFilters,
    sort: params.sort ?? "highest-utr",
    page: params.page ?? 1,
    pageSize: params.pageSize ?? PLAYERS_PER_PAGE,
  };
}

/**
 * College Player Search: filtered, sorted, paginated players from Supabase.
 * UI must not query Supabase directly — use this service (or its server action).
 */
export async function searchPlayers(
  params: PlayerSearchParams = {},
): Promise<PlayerSearchResult> {
  const input = normalizeSearchInput(params);
  const { rows, totalCount, page, pageSize } = await queryPlayersPage(input);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return {
    players: rows.map(mapPlayerSearchRowToPlayer),
    totalCount,
    page: Math.min(page, totalPages),
    pageSize,
    totalPages,
  };
}

export type { Player, PlayerDetail };
