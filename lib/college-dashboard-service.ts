import { createClient } from "@/lib/supabase/server";
import { getCurrentCollegeId } from "@/lib/college-profile-service";
import { getPlayers, type Player } from "@/lib/player-service";
import { countUnreadNotifications } from "@/lib/notifications/queries";
import {
  getRecentlyViewed,
  getRecentlyViewedCount,
} from "@/lib/recently-viewed-service";
import {
  getSavedPlayers,
  type SavedPlayerRecord,
} from "@/lib/saved-player-service";

export type CollegeDashboardData = {
  savedPlayersCount: number;
  unreadMessages: number;
  playersCount: number;
  recentlyViewedCount: number;
  players: Player[];
  savedRecords: SavedPlayerRecord[];
  recentViewedPlayers: Player[];
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
      recentlyViewedCount: 0,
      players,
      savedRecords: [],
      recentViewedPlayers: [],
    };
  }

  const [savedRecords, recentViewedPlayers, recentlyViewedCount] =
    await Promise.all([
      getSavedPlayers(collegeId),
      getRecentlyViewed(10),
      getRecentlyViewedCount(),
    ]);

  return {
    savedPlayersCount: savedRecords.length,
    unreadMessages,
    playersCount: players.length,
    recentlyViewedCount,
    players,
    savedRecords,
    recentViewedPlayers,
  };
}
