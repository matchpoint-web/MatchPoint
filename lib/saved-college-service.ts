import type { Tables } from "@/lib/database.types";
import { getCollegesByIds } from "@/lib/college-search-service";
import type { College } from "@/lib/colleges";
import { ensureCurrentPlayerId } from "@/lib/players/queries";
import {
  deleteSavedCollege,
  insertSavedCollege,
  querySavedCollegeByPair,
  querySavedCollegeIdsForPlayer,
  querySavedCollegesForPlayer,
} from "@/lib/saved-colleges/queries";

export type SavedCollegeRecord = Tables<"saved_colleges">;

function toRecord(row: Tables<"saved_colleges">): SavedCollegeRecord {
  return {
    id: row.id,
    player_id: row.player_id,
    college_id: row.college_id,
    created_at: row.created_at,
  };
}

/** Saved college ids for the authenticated player (newest first). */
export async function getSavedCollegeIds(): Promise<string[]> {
  const playerId = await ensureCurrentPlayerId();
  return querySavedCollegeIdsForPlayer(playerId);
}

/** Saved-college records for the authenticated player. */
export async function getSavedCollegeRecords(): Promise<SavedCollegeRecord[]> {
  const playerId = await ensureCurrentPlayerId();
  const rows = await querySavedCollegesForPlayer(playerId);
  return rows.map(toRecord);
}

/**
 * Full college cards for the player's saved list (newest saves first).
 * Uses saved_colleges as the only source of truth.
 */
export async function getSavedColleges(): Promise<College[]> {
  const playerId = await ensureCurrentPlayerId();
  const ids = await querySavedCollegeIdsForPlayer(playerId);
  if (ids.length === 0) return [];

  const colleges = await getCollegesByIds(ids);
  const byId = new Map(colleges.map((c) => [c.id, c]));
  return ids
    .map((id) => byId.get(id))
    .filter((c): c is College => Boolean(c));
}

/** Whether the authenticated player has saved this college. */
export async function isCollegeSaved(collegeId: string): Promise<boolean> {
  if (!collegeId?.trim()) return false;
  const playerId = await ensureCurrentPlayerId();
  const existing = await querySavedCollegeByPair(playerId, collegeId.trim());
  return existing != null;
}

/**
 * Save a college for the authenticated player.
 * Idempotent: returns the existing row when already saved.
 */
export async function saveCollege(
  collegeId: string,
): Promise<SavedCollegeRecord> {
  const trimmed = collegeId.trim();
  if (!trimmed) {
    throw new Error("College id is required.");
  }

  const playerId = await ensureCurrentPlayerId();
  const existing = await querySavedCollegeByPair(playerId, trimmed);
  if (existing) {
    return toRecord(existing);
  }

  const inserted = await insertSavedCollege(playerId, trimmed);
  return toRecord(inserted);
}

/** Remove a saved college for the authenticated player. */
export async function removeSavedCollege(collegeId: string): Promise<void> {
  const trimmed = collegeId.trim();
  if (!trimmed) {
    throw new Error("College id is required.");
  }

  const playerId = await ensureCurrentPlayerId();
  await deleteSavedCollege(playerId, trimmed);
}

/**
 * Toggle save for the authenticated player + college.
 * Returns true when the college is saved after the operation.
 */
export async function toggleSavedCollege(collegeId: string): Promise<boolean> {
  const trimmed = collegeId.trim();
  if (!trimmed) {
    throw new Error("College id is required.");
  }

  const saved = await isCollegeSaved(trimmed);
  if (saved) {
    await removeSavedCollege(trimmed);
    return false;
  }
  await saveCollege(trimmed);
  return true;
}
