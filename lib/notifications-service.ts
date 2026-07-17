import { createClient } from "@/lib/supabase/client";
import {
  NOTIFICATION_TYPES,
  toUiNotificationType,
  type CreateNotificationInput,
  type PlayerNotification,
} from "@/lib/player-notifications";

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

function mapRow(row: NotificationRow): PlayerNotification {
  return {
    id: row.id,
    type: toUiNotificationType(row.type),
    title: row.title,
    description: row.message,
    createdAt: row.created_at,
    unread: !row.is_read,
    metadata: row.metadata,
  };
}

async function requireUserId(): Promise<string> {
  const supabase = createClient();
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
 * Internal create path used only by service helpers (not React components).
 * Goes through SECURITY DEFINER RPC — clients have no INSERT policy.
 */
async function createNotification(
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

  await requireUserId();
  const supabase = createClient();

  const { data, error } = await supabase.rpc("create_notification", {
    target_user_id: input.userId,
    notification_type: input.type.trim(),
    notification_title: input.title.trim(),
    notification_message: input.message.trim(),
    notification_metadata: input.metadata ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return mapRow(data as NotificationRow);
}

/** Notifications for the current user (newest first). */
export async function getNotifications(): Promise<PlayerNotification[]> {
  const userId = await requireUserId();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, type, title, message, metadata, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as NotificationRow[] | null) ?? []).map(mapRow);
}

/** Mark a single notification as read. */
export async function markAsRead(notificationId: string): Promise<void> {
  if (!notificationId) {
    throw new Error("Notification id is required.");
  }

  const userId = await requireUserId();
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

/** Mark all of the current user's notifications as read. */
export async function markAllAsRead(): Promise<void> {
  const userId = await requireUserId();
  const supabase = createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}

export type NotifyNewMessageInput = {
  receiverUserId: string;
  senderLabel: string;
  messageBody: string;
  conversationId: string;
  messageId: string;
};

/**
 * Only supported cross-user notification creator today.
 * Called from the messages service after a successful send — not from UI.
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
 * Uses the same table + RPC; add authorization for the type in SQL when enabling.
 */
export async function notifyEvent(
  input: CreateNotificationInput,
): Promise<PlayerNotification> {
  return createNotification(input);
}

export type NotificationChange =
  | { event: "INSERT"; notification: PlayerNotification }
  | { event: "UPDATE"; notification: PlayerNotification };

/**
 * Subscribe to notification inserts/updates for the current user.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  onChange: (change: NotificationChange) => void,
): () => void {
  const supabase = createClient();
  let channel: ReturnType<typeof supabase.channel> | null = null;
  let cancelled = false;

  void (async () => {
    try {
      const userId = await requireUserId();
      if (cancelled) return;

      channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as NotificationRow;
            if (!row?.id) return;
            onChange({ event: "INSERT", notification: mapRow(row) });
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const row = payload.new as NotificationRow;
            if (!row?.id) return;
            onChange({ event: "UPDATE", notification: mapRow(row) });
          },
        )
        .subscribe();
    } catch {
      // Subscriber stays idle if unauthenticated.
    }
  })();

  return () => {
    cancelled = true;
    if (channel) {
      void supabase.removeChannel(channel);
    }
  };
}
