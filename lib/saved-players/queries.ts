import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const SAVED_PLAYERS_PER_PAGE = 50;

export type SavedPlayerRow = Tables<"saved_players">;

const SAVED_PLAYER_SELECT =
  "id, college_id, player_id, created_at" as const;

export type SavedPlayersPageQueryInput = {
  collegeId: string;
  page?: number;
  pageSize?: number;
};

export type SavedPlayersPageQueryResult = {
  rows: SavedPlayerRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

function normalizePage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1) || 1);
}

function normalizePageSize(
  pageSize: number | undefined,
  fallback: number,
): number {
  return pageSize && pageSize > 0 ? Math.floor(pageSize) : fallback;
}

/** All saved players for a college (newest first). */
export async function querySavedPlayersForCollege(
  collegeId: string,
): Promise<SavedPlayerRow[]> {
  if (!collegeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .select(SAVED_PLAYER_SELECT)
    .eq("college_id", collegeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as SavedPlayerRow[] | null) ?? [];
}

/** Paginated saved players for a college (newest first). */
export async function querySavedPlayersPage(
  input: SavedPlayersPageQueryInput,
): Promise<SavedPlayersPageQueryResult> {
  const pageSize = normalizePageSize(
    input.pageSize,
    SAVED_PLAYERS_PER_PAGE,
  );
  const page = normalizePage(input.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("saved_players")
    .select(SAVED_PLAYER_SELECT, { count: "exact" })
    .eq("college_id", input.collegeId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data as SavedPlayerRow[] | null) ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

/** Single save row for a college + player pair, if any. */
export async function querySavedPlayerByPair(
  collegeId: string,
  playerId: string,
): Promise<SavedPlayerRow | null> {
  if (!collegeId || !playerId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .select(SAVED_PLAYER_SELECT)
    .eq("college_id", collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as SavedPlayerRow | null) ?? null;
}

/**
 * Which of the given player ids are saved by this college.
 * Used by messaging and other batch UI enrichment.
 */
export async function querySavedPlayerIds(
  collegeId: string,
  playerIds: string[],
): Promise<string[]> {
  if (!collegeId || playerIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .select("player_id")
    .eq("college_id", collegeId)
    .in("player_id", playerIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => row.player_id)
    .filter((id): id is string => typeof id === "string");
}

export async function insertSavedPlayer(
  collegeId: string,
  playerId: string,
): Promise<SavedPlayerRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .insert({
      college_id: collegeId,
      player_id: playerId,
    })
    .select(SAVED_PLAYER_SELECT)
    .single();

  if (error) {
    // Unique (college_id, player_id) race: return the existing row.
    if (error.code === "23505") {
      const existing = await querySavedPlayerByPair(collegeId, playerId);
      if (existing) return existing;
    }
    throw new Error(error.message);
  }

  return data as SavedPlayerRow;
}

export async function deleteSavedPlayer(
  collegeId: string,
  playerId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_players")
    .delete()
    .eq("college_id", collegeId)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }
}
