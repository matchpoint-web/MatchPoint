import { createClient } from "@/lib/supabase/server";
import type { Player } from "@/lib/players";
import { mapPlayerSearchRowToPlayer } from "@/lib/players/mappers";
import {
  queryAuthenticatedPlayerById,
  queryAuthenticatedPlayersByIds,
} from "@/lib/players/queries";
import {
  PLAYER_SEARCH_SELECT,
  type PlayerSearchRow,
} from "@/lib/players/search-queries";
import {
  mapRowToCollegePlayerProfile,
  type CollegePlayerProfile,
} from "@/lib/college-player-profile";

export type { Player };

/** @deprecated Prefer CollegePlayerProfile — kept as alias for existing imports. */
export type PlayerDetail = CollegePlayerProfile;

/**
 * Fetch players linked to authenticated users (dashboard / legacy callers).
 * Prefer `searchPlayers` for College Player Search (filters + pagination).
 */
export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select(PLAYER_SEARCH_SELECT)
    .not("user_id", "is", null)
    .eq("account_status", "ACTIVE")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as PlayerSearchRow[] | null) ?? []).map(
    mapPlayerSearchRowToPlayer,
  );
}

/**
 * Fetch a single player profile by id for college view.
 * Only returns players linked to an authenticated user.
 */
export async function getPlayer(
  id: string,
): Promise<CollegePlayerProfile | null> {
  const row = await queryAuthenticatedPlayerById(id);
  if (!row) return null;
  return mapRowToCollegePlayerProfile(row);
}

/**
 * Resolve players by ids (saved list, dashboard, etc.).
 * Only returns players linked to authenticated users.
 */
export async function getPlayersByIds(ids: string[]): Promise<Player[]> {
  if (ids.length === 0) return [];

  const uniqueIds = [...new Set(ids)];
  const rows = await queryAuthenticatedPlayersByIds(uniqueIds);
  const byId = new Map(
    rows.map((row) => [row.id, mapPlayerSearchRowToPlayer(row)]),
  );

  return uniqueIds
    .map((id) => byId.get(id))
    .filter((player): player is Player => Boolean(player));
}
