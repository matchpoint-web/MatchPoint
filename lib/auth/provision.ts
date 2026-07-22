import type { UserRole } from "@/lib/auth/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type PlayerCollegeRole = Exclude<UserRole, "admin">;

/**
 * Repair missing players/colleges row after signup (service role).
 * Triggers normally create the row; this covers rare race / trigger misses.
 * Idempotent — never overwrites an existing profile.
 */
export async function repairProfileAfterSignup(input: {
  userId: string;
  role: PlayerCollegeRole;
  fullName?: string;
  schoolName?: string;
}): Promise<void> {
  const admin = createAdminClient();

  if (input.role === "player") {
    const { data: existing, error: selectError } = await admin
      .from("players")
      .select("id")
      .eq("user_id", input.userId)
      .maybeSingle();

    if (selectError) {
      throw new Error(selectError.message);
    }
    if (existing?.id) return;

    const { error: insertError } = await admin.from("players").insert({
      user_id: input.userId,
      full_name: input.fullName?.trim() || "",
      account_status: "ACTIVE",
    });

    if (insertError) {
      // Concurrent insert from trigger — treat as success when row exists.
      const { data: raced } = await admin
        .from("players")
        .select("id")
        .eq("user_id", input.userId)
        .maybeSingle();
      if (raced?.id) return;
      throw new Error(insertError.message);
    }
    return;
  }

  const { data: existing, error: selectError } = await admin
    .from("colleges")
    .select("id")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }
  if (existing?.id) return;

  const { error: insertError } = await admin.from("colleges").insert({
    user_id: input.userId,
    school_name: input.schoolName?.trim() || "My College",
    account_status: "PENDING",
  });

  if (insertError) {
    const { data: raced } = await admin
      .from("colleges")
      .select("id")
      .eq("user_id", input.userId)
      .maybeSingle();
    if (raced?.id) return;
    throw new Error(insertError.message);
  }
}

/**
 * Ensure the signed-in user has a profile row (login / callback repair).
 * Uses SECURITY DEFINER RPCs — safe for authenticated sessions only.
 */
export async function ensureSessionProfile(
  role: PlayerCollegeRole,
): Promise<void> {
  const supabase = await createClient();
  const rpcName =
    role === "player" ? "ensure_player_profile" : "ensure_college_profile";

  const { error } = await supabase.rpc(rpcName);
  if (error) {
    throw new Error(error.message);
  }
}

export function isDuplicateSignupError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("already been registered") ||
    lower.includes("already registered") ||
    lower.includes("user already exists") ||
    lower.includes("email address is already") ||
    lower.includes("duplicate")
  );
}
