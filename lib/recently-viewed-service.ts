import { createClient } from "@/lib/supabase/server";
import { getCurrentCollegeId } from "@/lib/college-profile-service";
import { getPlayersByIds, type Player } from "@/lib/player-service";

type RecentlyViewedRow = {
  player_id: string;
  viewed_at: string;
};

/**
 * Upsert a recently viewed player for the authenticated college.
 * Updates viewed_at on conflict; never creates duplicate (college_id, player_id) rows.
 */
export async function addRecentlyViewed(playerId: string): Promise<void> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) return;

  const supabase = await createClient();
  const viewedAt = new Date().toISOString();

  const { error } = await supabase.from("recently_viewed_players").upsert(
    {
      college_id: collegeId,
      player_id: playerId,
      viewed_at: viewedAt,
    },
    { onConflict: "college_id,player_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Recently viewed players for the authenticated college, newest first.
 */
export async function getRecentlyViewed(limit = 10): Promise<Player[]> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recently_viewed_players")
    .select("player_id, viewed_at")
    .eq("college_id", collegeId)
    .order("viewed_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as RecentlyViewedRow[] | null) ?? [];
  const ids = rows.map((row) => row.player_id);
  return getPlayersByIds(ids);
}

/**
 * Total recently viewed count for the authenticated college (stat card).
 */
export async function getRecentlyViewedCount(): Promise<number> {
  const collegeId = await getCurrentCollegeId();
  if (!collegeId) return 0;

  const supabase = await createClient();
  const { count, error } = await supabase
    .from("recently_viewed_players")
    .select("id", { count: "exact", head: true })
    .eq("college_id", collegeId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
