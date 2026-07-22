import { getCurrentCollegeId } from "@/lib/college-profile-service";
import {
  mapDocumentRowsToState,
  queryDocumentsForPlayer,
} from "@/lib/player-documents/queries";
import type { PlayerDocumentsState } from "@/lib/player-documents";
import { getCollegePlayerProfile } from "@/lib/college-player-profile-service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * College-facing document retrieval for a player profile.
 * Reuses shared queries + signed-URL mapping; never returns storage_path.
 */
export async function getPlayerDocumentsForCollege(
  playerId: string,
): Promise<PlayerDocumentsState> {
  const trimmed = playerId.trim();
  if (!trimmed || !UUID_RE.test(trimmed)) {
    throw new Error("Invalid player id.");
  }

  const collegeId = await getCurrentCollegeId();
  if (!collegeId) {
    throw new Error("Not authorized");
  }

  // Same visibility gate as college player profiles (authenticated players only).
  const player = await getCollegePlayerProfile(trimmed);
  if (!player) {
    throw new Error("Player not found");
  }

  const rows = await queryDocumentsForPlayer(trimmed);
  return mapDocumentRowsToState(rows, "getPlayerDocumentsForCollege");
}
