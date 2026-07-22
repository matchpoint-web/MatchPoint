import { mapRowToCollegePlayerProfile } from "@/lib/college-player-profile";
import type { CollegePlayerProfile } from "@/lib/college-player-profile";
import { queryAuthenticatedPlayerById } from "@/lib/players/queries";

/**
 * Load a player profile for the college recruiting UI.
 * RLS + authenticated-player filter enforced in queries.
 */
export async function getCollegePlayerProfile(
  playerId: string,
): Promise<CollegePlayerProfile | null> {
  const row = await queryAuthenticatedPlayerById(playerId);
  if (!row) return null;
  return mapRowToCollegePlayerProfile(row);
}
