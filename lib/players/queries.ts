import { createClient } from "@/lib/supabase/server";
import type { PlayerProfileRow } from "@/lib/players/types";

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

  const { data, error } = await supabase
    .from("players")
    .select(
      "id, user_id, full_name, nationality, graduation_year, utr, gpa, height, weight, dominant_hand, backhand, date_of_birth, bio, profile_image_url",
    )
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
