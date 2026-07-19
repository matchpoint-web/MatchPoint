import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";

export { getCurrentCollegeId } from "@/lib/college-profile-service";

export type SavedPlayerRecord = Tables<"saved_players">;

type SavedPlayerRow = Tables<"saved_players">;

export async function getSavedPlayers(
  collegeId: string,
): Promise<SavedPlayerRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .select("id, college_id, player_id, created_at")
    .eq("college_id", collegeId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as SavedPlayerRow[] | null) ?? []).map((row) => ({
    id: row.id,
    college_id: row.college_id,
    player_id: row.player_id,
    created_at: row.created_at,
  }));
}

export async function savePlayer(
  collegeId: string,
  playerId: string,
): Promise<SavedPlayerRecord> {
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("saved_players")
    .select("id, college_id, player_id, created_at")
    .eq("college_id", collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const row = existing as SavedPlayerRow;
    return {
      id: row.id,
      college_id: row.college_id,
      player_id: row.player_id,
      created_at: row.created_at,
    };
  }

  const { data, error } = await supabase
    .from("saved_players")
    .insert({
      college_id: collegeId,
      player_id: playerId,
    })
    .select("id, college_id, player_id, created_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as SavedPlayerRow;
  return {
    id: row.id,
    college_id: row.college_id,
    player_id: row.player_id,
    created_at: row.created_at,
  };
}

export async function removeSavedPlayer(
  collegeId: string,
  playerId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("saved_players")
    .delete()
    .eq("college_id", collegeId)
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function isPlayerSaved(
  collegeId: string,
  playerId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .select("id")
    .eq("college_id", collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
