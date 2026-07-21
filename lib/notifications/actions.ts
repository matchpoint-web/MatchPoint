"use server";

import {
  getNotifications,
  listNotifications,
  markAllAsRead,
  markAsRead,
  type NotificationsPageResult,
} from "@/lib/notifications-service";
import { NOTIFICATIONS_PER_PAGE } from "@/lib/notifications/queries";
import type { PlayerNotification } from "@/lib/player-notifications";

export type ListNotificationsActionInput = {
  page?: number;
  pageSize?: number;
};

/** Paginated notifications for the current user. */
export async function listNotificationsAction(
  input: ListNotificationsActionInput = {},
): Promise<NotificationsPageResult> {
  const page =
    typeof input.page === "number" && Number.isFinite(input.page)
      ? Math.max(1, Math.floor(input.page))
      : 1;
  const pageSize =
    typeof input.pageSize === "number" && Number.isFinite(input.pageSize)
      ? Math.max(1, Math.floor(input.pageSize))
      : NOTIFICATIONS_PER_PAGE;

  return listNotifications({ page, pageSize });
}

/** First page of notifications (newest first). */
export async function getNotificationsAction(): Promise<PlayerNotification[]> {
  return getNotifications();
}

/** Mark one notification as read. */
export async function markAsReadAction(
  notificationId: string,
): Promise<{ error: string | null }> {
  if (!notificationId?.trim()) {
    return { error: "Notification id is required." };
  }

  try {
    await markAsRead(notificationId.trim());
    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark as read.";
    return { error: message };
  }
}

/** Mark all notifications as read for the current user. */
export async function markAllAsReadAction(): Promise<{
  error: string | null;
}> {
  try {
    await markAllAsRead();
    return { error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to mark all as read.";
    return { error: message };
  }
}
