import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole } from "@/lib/auth/utils";

/**
 * Hard guarantees for account-status mutations:
 * - Acting admin cannot target their own auth user id
 * - Target auth user cannot be an admin (self or peer)
 *
 * Admin accounts have no player/college status UI and are never managed here.
 * Because admins cannot be suspended via the app, the last admin cannot be
 * locked out through MatchPoint status actions.
 */
export async function assertTargetUserIsNotAdmin(
  targetUserId: string | null | undefined,
  actingAdminUserId: string,
): Promise<void> {
  if (!targetUserId) {
    // Orphan profile rows are not admin accounts.
    return;
  }

  if (targetUserId === actingAdminUserId) {
    throw new Error("You cannot change the status of your own account.");
  }

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.getUserById(targetUserId);

  if (error) {
    throw new Error(error.message);
  }

  const targetRole = getUserRole(data.user);
  if (targetRole === "admin") {
    throw new Error(
      "Admin accounts cannot be suspended or managed through MatchPoint.",
    );
  }
}
