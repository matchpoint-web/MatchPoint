"use server";

import {
  getCurrentCollegeId,
  isPlayerSaved,
  removeSavedPlayer,
  savePlayer,
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
  const collegeId = await requireCollegeId();
  const saved = await isPlayerSaved(collegeId, playerId);

  if (saved) {
    await removeSavedPlayer(collegeId, playerId);
    return false;
  }

  await savePlayer(collegeId, playerId);
  return true;
}

export async function removeSavedPlayerAction(
  playerId: string,
): Promise<void> {
  const collegeId = await requireCollegeId();
  await removeSavedPlayer(collegeId, playerId);
}

export async function savePlayerAction(playerId: string): Promise<void> {
  const collegeId = await requireCollegeId();
  await savePlayer(collegeId, playerId);
}
