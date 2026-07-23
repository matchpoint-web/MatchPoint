import type { Json, Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type NotificationRow = Tables<"notifications">;

export const NOTIFICATIONS_PER_PAGE = 50;

const NOTIFICATION_SELECT =
  "id, user_id, type, title, message, metadata, is_read, created_at" as const;

export type NotificationsPageQueryInput = {
  userId: string;
  page?: number;
  pageSize?: number;
};

export type NotificationsPageQueryResult = {
  rows: NotificationRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

function normalizePage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1) || 1);
}

function normalizePageSize(
  pageSize: number | undefined,
  fallback: number,
): number {
  return pageSize && pageSize > 0 ? Math.floor(pageSize) : fallback;
}

/** Paginated notifications for a user (newest first). */
export async function queryNotificationsPage(
  input: NotificationsPageQueryInput,
): Promise<NotificationsPageQueryResult> {
  if (!input.userId) {
    return { rows: [], totalCount: 0, page: 1, pageSize: NOTIFICATIONS_PER_PAGE };
  }

  const pageSize = normalizePageSize(
    input.pageSize,
    NOTIFICATIONS_PER_PAGE,
  );
  const page = normalizePage(input.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT, { count: "exact" })
    .eq("user_id", input.userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data as NotificationRow[] | null) ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

/** Recent notifications (newest first), limited. */
export async function queryRecentNotifications(
  userId: string,
  limit: number,
): Promise<NotificationRow[]> {
  if (!userId || limit <= 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data as NotificationRow[] | null) ?? [];
}

export async function countUnreadNotifications(
  userId: string,
  type?: string,
): Promise<number> {
  if (!userId) return 0;

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

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Unread `new_message` notification counts keyed by metadata.conversationId.
 * Dashboard message stats and inbox badges share this source of truth.
 */
export async function queryUnreadNewMessageCountsByConversation(
  userId: string,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!userId) return counts;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, metadata")
    .eq("user_id", userId)
    .eq("type", "new_message")
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    const metadata = row.metadata;
    if (
      metadata == null ||
      typeof metadata !== "object" ||
      Array.isArray(metadata)
    ) {
      continue;
    }
    const conversationId = (metadata as Record<string, unknown>).conversationId;
    if (typeof conversationId !== "string" || !conversationId.trim()) {
      continue;
    }
    const key = conversationId.trim();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return counts;
}

/**
 * Mark unread new_message notifications for one conversation as read.
 * Used when the recipient opens that conversation thread.
 *
 * Selects matching rows then updates by id (avoids fragile JSON filter operators).
 */
export async function markNewMessageNotificationsReadForConversation(
  userId: string,
  conversationId: string,
): Promise<number> {
  const trimmedUserId = userId?.trim() ?? "";
  const trimmedConversationId = conversationId?.trim() ?? "";
  if (!trimmedUserId || !trimmedConversationId) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, metadata")
    .eq("user_id", trimmedUserId)
    .eq("type", "new_message")
    .eq("is_read", false);

  if (error) {
    throw new Error(
      `markNewMessageNotificationsReadForConversation select failed: ${error.message}` +
        (error.code ? ` [${error.code}]` : "") +
        (error.details ? ` details=${error.details}` : "") +
        (error.hint ? ` hint=${error.hint}` : ""),
    );
  }

  const ids = (data ?? [])
    .filter((row) => {
      const metadata = row.metadata;
      if (
        metadata == null ||
        typeof metadata !== "object" ||
        Array.isArray(metadata)
      ) {
        return false;
      }
      const value = (metadata as Record<string, unknown>).conversationId;
      return (
        typeof value === "string" && value.trim() === trimmedConversationId
      );
    })
    .map((row) => row.id);

  if (ids.length === 0) return 0;

  const { error: updateError } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", trimmedUserId)
    .in("id", ids);

  if (updateError) {
    throw new Error(
      `markNewMessageNotificationsReadForConversation update failed: ${updateError.message}` +
        (updateError.code ? ` [${updateError.code}]` : "") +
        (updateError.details ? ` details=${updateError.details}` : "") +
        (updateError.hint ? ` hint=${updateError.hint}` : ""),
    );
  }

  return ids.length;
}

/**
 * Create a notification via the SECURITY DEFINER RPC.
 * Clients have no INSERT policy on notifications.
 */
export async function rpcCreateNotification(input: {
  targetUserId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Json | null;
}): Promise<NotificationRow> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_notification", {
    target_user_id: input.targetUserId,
    notification_type: input.type,
    notification_title: input.title,
    notification_message: input.message,
    notification_metadata: input.metadata ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as NotificationRow;
}
