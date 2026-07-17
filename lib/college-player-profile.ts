import {
  getPlayer,
  type Player,
  type PlayerDetail,
} from "@/lib/player-service";

export type ProfileVideo = {
  id: string;
  title: string;
  duration: string;
};

export type TournamentResult = {
  id: string;
  title: string;
  year: string;
  description: string;
};

export type ProfileDocument = {
  id: string;
  name: string;
  status: "available" | "missing";
};

/** College-facing player profile. Backed by player-service. */
export type CollegePlayerProfile = PlayerDetail;

/**
 * Load a player profile for college view.
 * Delegates to player-service so UI never talks to Supabase directly.
 */
export async function getCollegePlayerProfile(
  id: string,
): Promise<CollegePlayerProfile | null> {
  return getPlayer(id);
}

export type { Player };
