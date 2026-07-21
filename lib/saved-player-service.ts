import type { Tables } from "@/lib/database.types";
import {
  deleteSavedPlayer,
  insertSavedPlayer,
  querySavedPlayerByPair,
  querySavedPlayerIds,
  querySavedPlayersForCollege,
  querySavedPlayersPage,
  SAVED_PLAYERS_PER_PAGE,
} from "@/lib/saved-players/queries";

export { getCurrentCollegeId } from "@/lib/college-profile-service";
export { querySavedPlayerIds } from "@/lib/saved-players/queries";

export type SavedPlayerRecord = Tables<"saved_players">;

export type SavedPlayersPageResult = {
  records: SavedPlayerRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function toRecord(row: Tables<"saved_players">): SavedPlayerRecord {
  return {
    id: row.id,
    college_id: row.college_id,
    player_id: row.player_id,
    created_at: row.created_at,
  };
}

/** Saved players for a college (newest first). */
export async function getSavedPlayers(
  collegeId: string,
): Promise<SavedPlayerRecord[]> {
  if (!collegeId) return [];
  const rows = await querySavedPlayersForCollege(collegeId);
  return rows.map(toRecord);
}

/** Paginated saved players for a college. */
export async function listSavedPlayers(
  collegeId: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<SavedPlayersPageResult> {
  const pageSize = params.pageSize ?? SAVED_PLAYERS_PER_PAGE;
  const page = params.page ?? 1;
  const { rows, totalCount, page: resolvedPage, pageSize: resolvedSize } =
    await querySavedPlayersPage({
      collegeId,
      page,
      pageSize,
    });

  return {
    records: rows.map(toRecord),
    totalCount,
    page: resolvedPage,
    pageSize: resolvedSize,
    totalPages: Math.max(1, Math.ceil(totalCount / resolvedSize)),
  };
}

/**
 * Save a player for a college.
 * Idempotent: returns the existing row when already saved.
 */
export async function savePlayer(
  collegeId: string,
  playerId: string,
): Promise<SavedPlayerRecord> {
  if (!collegeId) {
    throw new Error("College id is required.");
  }
  if (!playerId) {
    throw new Error("Player id is required.");
  }

  const existing = await querySavedPlayerByPair(collegeId, playerId);
  if (existing) {
    return toRecord(existing);
  }

  const inserted = await insertSavedPlayer(collegeId, playerId);
  return toRecord(inserted);
}

/** Remove a saved player for a college. */
export async function removeSavedPlayer(
  collegeId: string,
  playerId: string,
): Promise<void> {
  if (!collegeId) {
    throw new Error("College id is required.");
  }
  if (!playerId) {
    throw new Error("Player id is required.");
  }

  await deleteSavedPlayer(collegeId, playerId);
}

/** Whether the college has saved this player. */
export async function isPlayerSaved(
  collegeId: string,
  playerId: string,
): Promise<boolean> {
  if (!collegeId || !playerId) return false;
  const existing = await querySavedPlayerByPair(collegeId, playerId);
  return existing != null;
}

/**
 * Toggle save for a college + player.
 * Returns true when the player is saved after the operation.
 */
export async function toggleSavedPlayer(
  collegeId: string,
  playerId: string,
): Promise<boolean> {
  const saved = await isPlayerSaved(collegeId, playerId);
  if (saved) {
    await removeSavedPlayer(collegeId, playerId);
    return false;
  }
  await savePlayer(collegeId, playerId);
  return true;
}
