import type { Json } from "@/lib/database.types";
import {
  NOTIFICATION_TYPES,
  toUiNotificationType,
  type CreateNotificationInput,
  type PlayerNotification,
} from "@/lib/player-notifications";
import { createClient } from "@/lib/supabase/server";
import {
  countUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  NOTIFICATIONS_PER_PAGE,
  queryNotificationsPage,
  queryRecentNotifications,
  rpcCreateNotification,
  type NotificationRow,
} from "@/lib/notifications/queries";

export type NotificationsPageResult = {
  notifications: PlayerNotification[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type NotifyNewMessageInput = {
  receiverUserId: string;
  senderLabel: string;
  messageBody: string;
  conversationId: string;
  messageId: string;
};

function metadataToRecord(
  metadata: Json | null,
): Record<string, unknown> | null {
  if (metadata == null) return null;
  if (typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return null;
}

/** Map a DB notification row to the UI notification shape. */
export function mapNotificationRow(row: NotificationRow): PlayerNotification {
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

async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  return user.id;
}

/**
 * Create via SECURITY DEFINER RPC — used by event services, not the UI.
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<PlayerNotification> {
  if (!input.userId) {
    throw new Error("userId is required.");
  }
  if (!input.type.trim()) {
    throw new Error("type is required.");
  }
  if (!input.title.trim() || !input.message.trim()) {
    throw new Error("title and message are required.");
  }

  // Ensure caller is authenticated; RPC enforces cross-user rules.
  await requireUserId();

  const row = await rpcCreateNotification({
    targetUserId: input.userId,
    type: input.type.trim(),
    title: input.title.trim(),
    message: input.message.trim(),
    metadata: (input.metadata ?? null) as Json | null,
  });

  return mapNotificationRow(row);
}

/** Paginated notifications for the current user (newest first). */
export async function listNotifications(params: {
  page?: number;
  pageSize?: number;
} = {}): Promise<NotificationsPageResult> {
  const userId = await requireUserId();
  const pageSize = params.pageSize ?? NOTIFICATIONS_PER_PAGE;
  const page = params.page ?? 1;

  const { rows, totalCount, page: resolvedPage, pageSize: resolvedSize } =
    await queryNotificationsPage({
      userId,
      page,
      pageSize,
    });

  return {
    notifications: rows.map(mapNotificationRow),
    totalCount,
    page: resolvedPage,
    pageSize: resolvedSize,
    totalPages: Math.max(1, Math.ceil(totalCount / resolvedSize)),
  };
}

/** First page convenience helper. */
export async function getNotifications(): Promise<PlayerNotification[]> {
  const result = await listNotifications({
    page: 1,
    pageSize: NOTIFICATIONS_PER_PAGE,
  });
  return result.notifications;
}

/** Mark a single notification as read (own rows only). */
export async function markAsRead(notificationId: string): Promise<void> {
  if (!notificationId?.trim()) {
    throw new Error("Notification id is required.");
  }

  const userId = await requireUserId();
  await markNotificationRead(userId, notificationId.trim());
}

/** Mark all of the current user's unread notifications as read. */
export async function markAllAsRead(): Promise<void> {
  const userId = await requireUserId();
  await markAllNotificationsRead(userId);
}

/**
 * Cross-user new-message notification (authorized by create_notification RPC).
 * Called from the messages service after a successful send.
 */
export async function notifyNewMessage(
  input: NotifyNewMessageInput,
): Promise<PlayerNotification> {
  const preview =
    input.messageBody.length > 120
      ? `${input.messageBody.slice(0, 117)}...`
      : input.messageBody;

  return createNotification({
    userId: input.receiverUserId,
    type: NOTIFICATION_TYPES.newMessage,
    title: `New message from ${input.senderLabel}`,
    message: preview,
    metadata: {
      conversationId: input.conversationId,
      messageId: input.messageId,
    },
  });
}

/**
 * Reserved for future event services (saved player, profile view, etc.).
 * Cross-user types need matching rules in can_create_notification_for.
 */
export async function notifyEvent(
  input: CreateNotificationInput,
): Promise<PlayerNotification> {
  return createNotification(input);
}

/** Unread count for dashboards (optional type filter). */
export async function getUnreadNotificationCount(
  type?: string,
): Promise<number> {
  const userId = await requireUserId();
  return countUnreadNotifications(userId, type);
}

/** Recent notifications for dashboard activity feeds. */
export async function getRecentUserNotifications(
  limit = 5,
): Promise<PlayerNotification[]> {
  const userId = await requireUserId();
  const rows = await queryRecentNotifications(userId, limit);
  return rows.map(mapNotificationRow);
}

/** Shared helpers for other server services that already have userId. */
export {
  countUnreadNotifications,
  queryRecentNotifications,
} from "@/lib/notifications/queries";
