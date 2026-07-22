import type {
  CollegeAccountStatus,
  PlayerAccountStatus,
  SuspendedReason,
} from "@/lib/account-status";
import {
  isCollegeAccountStatus,
  isPlayerAccountStatus,
  isSuspendedReason,
} from "@/lib/account-status";
import { createClient } from "@/lib/supabase/server";

const ADMIN_PLAYER_LIST_SELECT =
  "id, user_id, full_name, nationality, graduation_year, utr, account_status, created_at" as const;

const ADMIN_PLAYER_DETAIL_SELECT =
  "id, user_id, full_name, nationality, graduation_year, utr, gpa, height, weight, dominant_hand, backhand, date_of_birth, bio, profile_image_url, account_status, suspended_reason, suspended_at, suspended_by, created_at, updated_at" as const;

const ADMIN_COLLEGE_LIST_SELECT =
  "id, user_id, school_name, division, location, state, city, contact_email, head_coach, account_status, created_at" as const;

const ADMIN_COLLEGE_DETAIL_SELECT =
  "id, user_id, school_name, division, location, conference, state, city, website, head_coach, assistant_coach, contact_email, about_program, facilities, recruiting_information, logo_url, account_status, suspended_reason, suspended_at, suspended_by, created_at, updated_at" as const;

export type AdminPlayerListRow = {
  id: string;
  user_id: string | null;
  full_name: string;
  nationality: string | null;
  graduation_year: number | null;
  utr: number | null;
  account_status: string;
  created_at: string;
};

export type AdminPlayerDetailRow = AdminPlayerListRow & {
  gpa: number | null;
  height: number | null;
  weight: number | null;
  dominant_hand: string | null;
  backhand: string | null;
  date_of_birth: string | null;
  bio: string | null;
  profile_image_url: string | null;
  suspended_reason: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  updated_at: string;
};

export type AdminCollegeListRow = {
  id: string;
  user_id: string | null;
  school_name: string;
  division: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  contact_email: string | null;
  head_coach: string | null;
  account_status: string;
  created_at: string;
};

export type AdminCollegeDetailRow = AdminCollegeListRow & {
  conference: string | null;
  website: string | null;
  assistant_coach: string | null;
  about_program: string | null;
  facilities: string | null;
  recruiting_information: string | null;
  logo_url: string | null;
  suspended_reason: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  updated_at: string;
};

function normalizeSearch(search: string | undefined): string {
  return search?.trim() ?? "";
}

export function parsePlayerAccountStatus(
  value: string,
): PlayerAccountStatus {
  if (!isPlayerAccountStatus(value)) {
    throw new Error(`Invalid player account status: ${value}`);
  }
  return value;
}

export function parseCollegeAccountStatus(
  value: string,
): CollegeAccountStatus {
  if (!isCollegeAccountStatus(value)) {
    throw new Error(`Invalid college account status: ${value}`);
  }
  return value;
}

export function parseSuspendedReason(
  value: string | null,
): SuspendedReason | null {
  if (value == null) return null;
  if (!isSuspendedReason(value)) {
    throw new Error(`Invalid suspended reason: ${value}`);
  }
  return value;
}

export async function queryAdminDashboardCounts(): Promise<{
  activePlayers: number;
  suspendedPlayers: number;
  pendingColleges: number;
  approvedColleges: number;
  suspendedColleges: number;
}> {
  const supabase = await createClient();

  const [
    activePlayers,
    suspendedPlayers,
    pendingColleges,
    approvedColleges,
    suspendedColleges,
  ] = await Promise.all([
    supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "ACTIVE"),
    supabase
      .from("players")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "SUSPENDED"),
    supabase
      .from("colleges")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "PENDING"),
    supabase
      .from("colleges")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "APPROVED"),
    supabase
      .from("colleges")
      .select("id", { count: "exact", head: true })
      .eq("account_status", "SUSPENDED"),
  ]);

  if (activePlayers.error) throw new Error(activePlayers.error.message);
  if (suspendedPlayers.error) throw new Error(suspendedPlayers.error.message);
  if (pendingColleges.error) throw new Error(pendingColleges.error.message);
  if (approvedColleges.error) throw new Error(approvedColleges.error.message);
  if (suspendedColleges.error) {
    throw new Error(suspendedColleges.error.message);
  }

  return {
    activePlayers: activePlayers.count ?? 0,
    suspendedPlayers: suspendedPlayers.count ?? 0,
    pendingColleges: pendingColleges.count ?? 0,
    approvedColleges: approvedColleges.count ?? 0,
    suspendedColleges: suspendedColleges.count ?? 0,
  };
}

export async function queryAdminPlayers(search?: string): Promise<
  AdminPlayerListRow[]
> {
  const supabase = await createClient();
  const q = normalizeSearch(search);

  let request = supabase
    .from("players")
    .select(ADMIN_PLAYER_LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    request = request.or(
      `full_name.ilike.%${q}%,nationality.ilike.%${q}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data as AdminPlayerListRow[] | null) ?? [];
}

export async function queryAdminPlayerById(
  playerId: string,
): Promise<AdminPlayerDetailRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select(ADMIN_PLAYER_DETAIL_SELECT)
    .eq("id", playerId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AdminPlayerDetailRow | null) ?? null;
}

export async function suspendPlayerRow(
  playerId: string,
  reason: SuspendedReason,
  adminUserId: string,
): Promise<AdminPlayerDetailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .update({
      account_status: "SUSPENDED",
      suspended_reason: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: adminUserId,
    })
    .eq("id", playerId)
    .select(ADMIN_PLAYER_DETAIL_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as AdminPlayerDetailRow;
}

export async function restorePlayerRow(
  playerId: string,
): Promise<AdminPlayerDetailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .update({
      account_status: "ACTIVE",
      suspended_reason: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id", playerId)
    .select(ADMIN_PLAYER_DETAIL_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as AdminPlayerDetailRow;
}

export async function queryAdminColleges(search?: string): Promise<
  AdminCollegeListRow[]
> {
  const supabase = await createClient();
  const q = normalizeSearch(search);

  let request = supabase
    .from("colleges")
    .select(ADMIN_COLLEGE_LIST_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    request = request.or(
      `school_name.ilike.%${q}%,location.ilike.%${q}%,state.ilike.%${q}%,city.ilike.%${q}%,contact_email.ilike.%${q}%,head_coach.ilike.%${q}%`,
    );
  }

  const { data, error } = await request;
  if (error) throw new Error(error.message);
  return (data as AdminCollegeListRow[] | null) ?? [];
}

export async function queryAdminCollegeById(
  collegeId: string,
): Promise<AdminCollegeDetailRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select(ADMIN_COLLEGE_DETAIL_SELECT)
    .eq("id", collegeId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AdminCollegeDetailRow | null) ?? null;
}

export async function suspendCollegeRow(
  collegeId: string,
  reason: SuspendedReason,
  adminUserId: string,
): Promise<AdminCollegeDetailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .update({
      account_status: "SUSPENDED",
      suspended_reason: reason,
      suspended_at: new Date().toISOString(),
      suspended_by: adminUserId,
    })
    .eq("id", collegeId)
    .select(ADMIN_COLLEGE_DETAIL_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as AdminCollegeDetailRow;
}

export async function restoreCollegeRow(
  collegeId: string,
): Promise<AdminCollegeDetailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .update({
      account_status: "APPROVED",
      suspended_reason: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id", collegeId)
    .select(ADMIN_COLLEGE_DETAIL_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as AdminCollegeDetailRow;
}

export async function approveCollegeRow(
  collegeId: string,
): Promise<AdminCollegeDetailRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .update({
      account_status: "APPROVED",
      suspended_reason: null,
      suspended_at: null,
      suspended_by: null,
    })
    .eq("id", collegeId)
    .select(ADMIN_COLLEGE_DETAIL_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return data as AdminCollegeDetailRow;
}
