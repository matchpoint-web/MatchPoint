import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/utils";
import type { PlayerProfileRow } from "@/lib/players/types";

export const PLAYER_PROFILE_SELECT =
  "id, user_id, full_name, nationality, graduation_year, utr, gpa, height, weight, dominant_hand, backhand, date_of_birth, bio, profile_image_url" as const;

/**
 * Ensure the authenticated player owns a `players` row.
 * Creates one via `ensure_player_profile` when missing; returns the row id.
 */
export async function ensureCurrentPlayerId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  if (getUserRole(user) !== "player") {
    throw new Error("Not a player account");
  }

  const { data: existing, error: selectError } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing?.id) {
    return existing.id;
  }

  const { data: ensuredId, error: rpcError } = await supabase.rpc(
    "ensure_player_profile",
  );

  if (rpcError) {
    throw new Error(rpcError.message);
  }

  if (!ensuredId) {
    throw new Error("Could not create player profile");
  }

  return ensuredId;
}

/**
 * Load the authenticated player's profile from `players`.
 * Creates a row automatically when one does not exist yet.
 */
export async function getCurrentPlayerProfile(): Promise<{
  profile: PlayerProfileRow | null;
  userId: string;
  fallbackName: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const fallbackName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  if (getUserRole(user) === "player") {
    await ensureCurrentPlayerId();
  }

  const { data, error } = await supabase
    .from("players")
    .select(PLAYER_PROFILE_SELECT)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    profile: (data as PlayerProfileRow | null) ?? null,
    userId: user.id,
    fallbackName,
  };
}
