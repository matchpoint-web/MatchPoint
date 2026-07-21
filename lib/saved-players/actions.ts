"use server";

import {
  getCurrentCollegeId,
  isPlayerSaved,
  listSavedPlayers,
  removeSavedPlayer,
  savePlayer,
  toggleSavedPlayer,
  type SavedPlayerRecord,
  type SavedPlayersPageResult,
} from "@/lib/saved-player-service";

async function requireCollegeId(): Promise<string> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) {
    throw new Error("Not authenticated as a college account.");
  }
  return collegeId;
}

/** Toggle save for the current college. Returns true when the player is saved. */
export async function toggleSavedPlayerAction(
  playerId: string,
): Promise<boolean> {
  if (!playerId?.trim()) {
    throw new Error("Player id is required.");
  }
  const collegeId = await requireCollegeId();
  return toggleSavedPlayer(collegeId, playerId.trim());
}

export async function removeSavedPlayerAction(
  playerId: string,
): Promise<void> {
  if (!playerId?.trim()) {
    throw new Error("Player id is required.");
  }
  const collegeId = await requireCollegeId();
  await removeSavedPlayer(collegeId, playerId.trim());
}

export async function savePlayerAction(playerId: string): Promise<void> {
  if (!playerId?.trim()) {
    throw new Error("Player id is required.");
  }
  const collegeId = await requireCollegeId();
  await savePlayer(collegeId, playerId.trim());
}

/** Whether the current college has saved this player. */
export async function isPlayerSavedAction(
  playerId: string,
): Promise<boolean> {
  if (!playerId?.trim()) return false;
  const collegeId = await requireCollegeId();
  return isPlayerSaved(collegeId, playerId.trim());
}

/** Paginated saved-player records for the current college. */
export async function listSavedPlayersAction(input: {
  page?: number;
  pageSize?: number;
} = {}): Promise<SavedPlayersPageResult> {
  const collegeId = await requireCollegeId();
  return listSavedPlayers(collegeId, input);
}

/** Flat list of saved-player records for the current college. */
export async function getSavedPlayersAction(): Promise<SavedPlayerRecord[]> {
  const result = await listSavedPlayersAction();
  return result.records;
}
