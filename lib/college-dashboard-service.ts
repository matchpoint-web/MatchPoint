import { createClient } from "@/lib/supabase/server";
import { getCurrentCollegeId } from "@/lib/college-profile-service";
import { getPlayers, type Player } from "@/lib/player-service";
import { countUnreadNotifications } from "@/lib/notifications/queries";
import {
  getSavedPlayers,
  type SavedPlayerRecord,
} from "@/lib/saved-player-service";

export type CollegeDashboardData = {
  savedPlayersCount: number;
  unreadMessages: number;
  playersCount: number;
  players: Player[];
  savedRecords: SavedPlayerRecord[];
};

/**
 * Aggregated college dashboard payload (server-side).
 */
export async function getCollegeDashboardData(): Promise<CollegeDashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const [players, collegeId, unreadMessages] = await Promise.all([
    getPlayers(),
    getCurrentCollegeId(),
    countUnreadNotifications(user.id, "new_message"),
  ]);

  if (!collegeId) {
    return {
      savedPlayersCount: 0,
      unreadMessages,
      playersCount: players.length,
      players,
      savedRecords: [],
    };
  }

  const savedRecords = await getSavedPlayers(collegeId);

  return {
    savedPlayersCount: savedRecords.length,
    unreadMessages,
    playersCount: players.length,
    players,
    savedRecords,
  };
}
