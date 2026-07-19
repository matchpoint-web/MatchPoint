import { createClient } from "@/lib/supabase/server";
import { getCurrentCollegeId } from "@/lib/college-profile-service";
import { getPlayers, type Player } from "@/lib/player-service";
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

async function countUnreadMessageNotifications(
  userId: string,
): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "new_message")
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

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
    countUnreadMessageNotifications(user.id),
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
