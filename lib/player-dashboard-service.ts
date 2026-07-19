import { createClient } from "@/lib/supabase/server";
import type { Json, Tables } from "@/lib/database.types";
import { DOCUMENT_DEFINITIONS, toUiDocumentType } from "@/lib/player-documents";
import {
  calculateProfileCompletion,
  countRemainingSections,
  type PlayerDashboardProfile,
} from "@/lib/player-profile-service";
import {
  toUiNotificationType,
  type PlayerNotification,
} from "@/lib/player-notifications";
import { getCurrentPlayerProfile } from "@/lib/players/queries";
import type { PlayerProfileRow } from "@/lib/players/types";

export type PlayerDashboardActivityItem = PlayerNotification;

export type PlayerDashboardData = {
  profile: PlayerDashboardProfile;
  documents: {
    requiredUploaded: number;
    requiredTotal: number;
  };
  unreadMessages: number;
  unreadNotifications: number;
  savedByCollegesCount: number;
  recentActivity: PlayerDashboardActivityItem[];
};

type NotificationRow = Pick<
  Tables<"notifications">,
  "id" | "type" | "title" | "message" | "metadata" | "is_read" | "created_at"
>;

function metadataToRecord(
  metadata: Json | null,
): Record<string, unknown> | null {
  if (metadata == null) return null;
  if (typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return null;
}

function formatNumber(
  value: number | string | null | undefined,
  digits = 1,
): string {
  if (value == null || value === "") return "—";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

function toDashboardProfile(
  row: PlayerProfileRow | null,
  fallbackName: string,
): PlayerDashboardProfile {
  if (!row) {
    return {
      name: fallbackName || "Player",
      country: "—",
      graduationYear: "—",
      utr: "—",
      gpa: "—",
      completion: 0,
      remainingSections: 0,
      profileImageUrl: null,
    };
  }

  return {
    name: row.full_name?.trim() || fallbackName || "Player",
    country: row.nationality?.trim() || "—",
    graduationYear:
      row.graduation_year != null ? String(row.graduation_year) : "—",
    utr: formatNumber(row.utr, 1),
    gpa: formatNumber(row.gpa, 1),
    completion: calculateProfileCompletion(row),
    remainingSections: countRemainingSections(row),
    profileImageUrl: row.profile_image_url,
  };
}

function mapNotification(row: NotificationRow): PlayerNotification {
  return {
    id: row.id,
    type: toUiNotificationType(row.type),
    title: row.title,
    description: row.message,
    createdAt: row.created_at,
    unread: !row.is_read,
    metadata: metadataToRecord(row.metadata),
  };
}

async function countUnreadNotifications(
  userId: string,
  type?: string,
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (type) {
    query = query.eq("type", type);
  }

  const { count, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return count ?? 0;
}

async function getRecentNotifications(
  userId: string,
  limit: number,
): Promise<PlayerNotification[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, message, metadata, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return ((data as NotificationRow[] | null) ?? []).map(mapNotification);
}

async function getRequiredDocumentsProgress(playerId: string): Promise<{
  requiredUploaded: number;
  requiredTotal: number;
}> {
  const required = DOCUMENT_DEFINITIONS.filter((def) => !def.optional);
  const requiredTotal = required.length;
  if (requiredTotal === 0) {
    return { requiredUploaded: 0, requiredTotal: 0 };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("player_documents")
    .select("document_type")
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  const uploaded = new Set(
    ((data as { document_type: string }[] | null) ?? [])
      .map((row) => toUiDocumentType(row.document_type))
      .filter((id): id is NonNullable<typeof id> => Boolean(id)),
  );

  const requiredUploaded = required.filter((def) => uploaded.has(def.id)).length;
  return { requiredUploaded, requiredTotal };
}

async function countSavedByColleges(playerId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("saved_players")
    .select("id", { count: "exact", head: true })
    .eq("player_id", playerId);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

/**
 * Aggregated player dashboard payload (server-side).
 * Parallel counts — no full message/document payloads.
 */
export async function getPlayerDashboardData(): Promise<PlayerDashboardData> {
  const { profile, userId, fallbackName } = await getCurrentPlayerProfile();
  const dashboardProfile = toDashboardProfile(profile, fallbackName);
  const playerId = profile?.id;

  if (!playerId) {
    return {
      profile: dashboardProfile,
      documents: { requiredUploaded: 0, requiredTotal: 0 },
      unreadMessages: 0,
      unreadNotifications: 0,
      savedByCollegesCount: 0,
      recentActivity: [],
    };
  }

  const [
    documents,
    unreadMessages,
    unreadNotifications,
    savedByCollegesCount,
    recentActivity,
  ] = await Promise.all([
    getRequiredDocumentsProgress(playerId),
    countUnreadNotifications(userId, "new_message"),
    countUnreadNotifications(userId),
    countSavedByColleges(playerId),
    getRecentNotifications(userId, 5),
  ]);

  return {
    profile: dashboardProfile,
    documents,
    unreadMessages,
    unreadNotifications,
    savedByCollegesCount,
    recentActivity,
  };
}
