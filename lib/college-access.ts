import { redirect } from "next/navigation";
import type { CollegeAccountStatus } from "@/lib/account-status";
import { isCollegeAccountStatus } from "@/lib/account-status";
import { requireCollege } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/**
 * Current college account_status for the authenticated college user.
 * PENDING / SUSPENDED colleges may still reach settings.
 */
export async function getCurrentCollegeAccountStatus(): Promise<CollegeAccountStatus | null> {
  const user = await requireCollege();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("colleges")
    .select("account_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data?.account_status) return null;
  if (!isCollegeAccountStatus(data.account_status)) {
    throw new Error(`Invalid college account status: ${data.account_status}`);
  }
  return data.account_status;
}

/**
 * App-layer gate for recruiting routes (search, save, message).
 * RLS remains the hard backstop via is_approved_college_account().
 */
export async function requireApprovedCollege(): Promise<void> {
  const status = await getCurrentCollegeAccountStatus();
  if (status !== "APPROVED") {
    redirect("/college/settings");
  }
}
