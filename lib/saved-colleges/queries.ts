import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type SavedCollegeRow = Tables<"saved_colleges">;

const SAVED_COLLEGE_SELECT =
  "id, player_id, college_id, created_at" as const;

/** All saved college ids for a player (newest first). */
export async function querySavedCollegeIdsForPlayer(
  playerId: string,
): Promise<string[]> {
  if (!playerId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_colleges")
    .select("college_id")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => row.college_id)
    .filter((id): id is string => typeof id === "string");
}

/** All saved-college rows for a player (newest first). */
export async function querySavedCollegesForPlayer(
  playerId: string,
): Promise<SavedCollegeRow[]> {
  if (!playerId) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_colleges")
    .select(SAVED_COLLEGE_SELECT)
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as SavedCollegeRow[] | null) ?? [];
}

/** Single save row for a player + college pair, if any. */
export async function querySavedCollegeByPair(
  playerId: string,
  collegeId: string,
): Promise<SavedCollegeRow | null> {
  if (!playerId || !collegeId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_colleges")
    .select(SAVED_COLLEGE_SELECT)
    .eq("player_id", playerId)
    .eq("college_id", collegeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as SavedCollegeRow | null) ?? null;
}

export async function insertSavedCollege(
  playerId: string,
  collegeId: string,
): Promise<SavedCollegeRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_colleges")
    .insert({
      player_id: playerId,
      college_id: collegeId,
    })
    .select(SAVED_COLLEGE_SELECT)
    .single();

  if (error) {
    if (error.code === "23505") {
      const existing = await querySavedCollegeByPair(playerId, collegeId);
      if (existing) return existing;
    }
    throw new Error(error.message);
  }

  return data as SavedCollegeRow;
}

export async function deleteSavedCollege(
  playerId: string,
  collegeId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_colleges")
    .delete()
    .eq("player_id", playerId)
    .eq("college_id", collegeId);

  if (error) {
    throw new Error(error.message);
  }
}
