import { requireAdmin } from "@/lib/auth/actions";
import type { SuspendedReason } from "@/lib/account-status";
import { isSuspendedReason } from "@/lib/account-status";
import { assertTargetUserIsNotAdmin } from "@/lib/admin/safety";
import {
  approveCollegeRow,
  parseCollegeAccountStatus,
  parsePlayerAccountStatus,
  parseSuspendedReason,
  queryAdminCollegeById,
  queryAdminColleges,
  queryAdminDashboardCounts,
  queryAdminPlayerById,
  queryAdminPlayers,
  restoreCollegeRow,
  restorePlayerRow,
  suspendCollegeRow,
  suspendPlayerRow,
  type AdminCollegeDetailRow,
  type AdminCollegeListRow,
  type AdminPlayerDetailRow,
  type AdminPlayerListRow,
} from "@/lib/admin/queries";
import type {
  AdminCollegeDetail,
  AdminCollegeListItem,
  AdminDashboardStats,
  AdminPlayerDetail,
  AdminPlayerListItem,
} from "@/lib/admin/types";

function mapPlayerListItem(row: AdminPlayerListRow): AdminPlayerListItem {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    nationality: row.nationality,
    graduationYear: row.graduation_year,
    utr: row.utr,
    accountStatus: parsePlayerAccountStatus(row.account_status),
    createdAt: row.created_at,
  };
}

function mapPlayerDetail(row: AdminPlayerDetailRow): AdminPlayerDetail {
  return {
    ...mapPlayerListItem(row),
    gpa: row.gpa,
    height: row.height,
    weight: row.weight,
    dominantHand: row.dominant_hand,
    backhand: row.backhand,
    dateOfBirth: row.date_of_birth,
    bio: row.bio,
    profileImageUrl: row.profile_image_url,
    suspendedReason: parseSuspendedReason(row.suspended_reason),
    suspendedAt: row.suspended_at,
    suspendedBy: row.suspended_by,
    updatedAt: row.updated_at,
  };
}

function mapCollegeListItem(row: AdminCollegeListRow): AdminCollegeListItem {
  return {
    id: row.id,
    userId: row.user_id,
    schoolName: row.school_name,
    division: row.division,
    location: row.location,
    state: row.state,
    city: row.city,
    contactEmail: row.contact_email,
    headCoach: row.head_coach,
    accountStatus: parseCollegeAccountStatus(row.account_status),
    createdAt: row.created_at,
  };
}

function mapCollegeDetail(row: AdminCollegeDetailRow): AdminCollegeDetail {
  return {
    ...mapCollegeListItem(row),
    conference: row.conference,
    website: row.website,
    assistantCoach: row.assistant_coach,
    aboutProgram: row.about_program,
    facilities: row.facilities,
    recruitingInformation: row.recruiting_information,
    logoUrl: row.logo_url,
    suspendedReason: parseSuspendedReason(row.suspended_reason),
    suspendedAt: row.suspended_at,
    suspendedBy: row.suspended_by,
    updatedAt: row.updated_at,
  };
}

function requireSuspendedReason(reason: string): SuspendedReason {
  const trimmed = reason.trim();
  if (!isSuspendedReason(trimmed)) {
    throw new Error("A valid suspension reason is required.");
  }
  return trimmed;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  await requireAdmin();
  return queryAdminDashboardCounts();
}

export async function listAdminPlayers(
  search?: string,
): Promise<AdminPlayerListItem[]> {
  await requireAdmin();
  const rows = await queryAdminPlayers(search);
  return rows.map(mapPlayerListItem);
}

export async function getAdminPlayer(
  playerId: string,
): Promise<AdminPlayerDetail | null> {
  await requireAdmin();
  if (!playerId.trim()) return null;
  const row = await queryAdminPlayerById(playerId.trim());
  return row ? mapPlayerDetail(row) : null;
}

export async function suspendPlayer(
  playerId: string,
  reason: string,
): Promise<AdminPlayerDetail> {
  const adminUser = await requireAdmin();
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const existing = await queryAdminPlayerById(playerId.trim());
  if (!existing) {
    throw new Error("Player not found.");
  }

  await assertTargetUserIsNotAdmin(existing.user_id, adminUser.id);
  const suspendedReason = requireSuspendedReason(reason);
  const row = await suspendPlayerRow(
    playerId.trim(),
    suspendedReason,
    adminUser.id,
  );
  return mapPlayerDetail(row);
}

export async function restorePlayer(
  playerId: string,
): Promise<AdminPlayerDetail> {
  const adminUser = await requireAdmin();
  if (!playerId.trim()) {
    throw new Error("Player id is required.");
  }

  const existing = await queryAdminPlayerById(playerId.trim());
  if (!existing) {
    throw new Error("Player not found.");
  }

  await assertTargetUserIsNotAdmin(existing.user_id, adminUser.id);
  const row = await restorePlayerRow(playerId.trim());
  return mapPlayerDetail(row);
}

export async function listAdminColleges(
  search?: string,
): Promise<AdminCollegeListItem[]> {
  await requireAdmin();
  const rows = await queryAdminColleges(search);
  return rows.map(mapCollegeListItem);
}

export async function getAdminCollege(
  collegeId: string,
): Promise<AdminCollegeDetail | null> {
  await requireAdmin();
  if (!collegeId.trim()) return null;
  const row = await queryAdminCollegeById(collegeId.trim());
  return row ? mapCollegeDetail(row) : null;
}

export async function approveCollege(
  collegeId: string,
): Promise<AdminCollegeDetail> {
  const adminUser = await requireAdmin();
  if (!collegeId.trim()) {
    throw new Error("College id is required.");
  }

  const existing = await queryAdminCollegeById(collegeId.trim());
  if (!existing) {
    throw new Error("College not found.");
  }

  await assertTargetUserIsNotAdmin(existing.user_id, adminUser.id);
  const row = await approveCollegeRow(collegeId.trim());
  return mapCollegeDetail(row);
}

export async function suspendCollege(
  collegeId: string,
  reason: string,
): Promise<AdminCollegeDetail> {
  const adminUser = await requireAdmin();
  if (!collegeId.trim()) {
    throw new Error("College id is required.");
  }

  const existing = await queryAdminCollegeById(collegeId.trim());
  if (!existing) {
    throw new Error("College not found.");
  }

  await assertTargetUserIsNotAdmin(existing.user_id, adminUser.id);
  const suspendedReason = requireSuspendedReason(reason);
  const row = await suspendCollegeRow(
    collegeId.trim(),
    suspendedReason,
    adminUser.id,
  );
  return mapCollegeDetail(row);
}

export async function restoreCollege(
  collegeId: string,
): Promise<AdminCollegeDetail> {
  const adminUser = await requireAdmin();
  if (!collegeId.trim()) {
    throw new Error("College id is required.");
  }

  const existing = await queryAdminCollegeById(collegeId.trim());
  if (!existing) {
    throw new Error("College not found.");
  }

  await assertTargetUserIsNotAdmin(existing.user_id, adminUser.id);
  const row = await restoreCollegeRow(collegeId.trim());
  return mapCollegeDetail(row);
}
