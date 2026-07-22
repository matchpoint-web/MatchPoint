"use server";

import { getPlayerDocumentsForCollege } from "@/lib/college-player-documents-service";
import type { PlayerDocumentsState } from "@/lib/player-documents";

export type CollegePlayerDocumentsResult = {
  error: string | null;
  documents: PlayerDocumentsState | null;
};

/**
 * Load a player's documents for the authenticated college account.
 * Returns signed URLs only — no storage paths.
 */
export async function getPlayerDocumentsForCollegeAction(
  playerId: string,
): Promise<CollegePlayerDocumentsResult> {
  if (!playerId?.trim()) {
    return { error: "Player id is required.", documents: null };
  }

  try {
    const documents = await getPlayerDocumentsForCollege(playerId.trim());
    return { error: null, documents };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to load player documents.";
    return { error: message, documents: null };
  }
}
