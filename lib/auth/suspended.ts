import { createClient } from "@/lib/supabase/server";

export const SUSPENDED_ACCOUNT_PATH = "/account/suspended";

/**
 * Returns whether the authenticated player row is suspended.
 * Admins/colleges are never routed through the player suspended screen.
 */
export async function isPlayerAccountSuspended(
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("account_status")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.account_status === "SUSPENDED";
}
