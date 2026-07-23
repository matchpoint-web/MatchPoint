/** Known storage type ids. New events can add string ids without DB migrations. */
export type NotificationTypeId = string;

export const NOTIFICATION_TYPES = {
  newMessage: "new_message",
  playerSaved: "player_saved",
  profileView: "profile_view",
  reminder: "reminder",
} as const;

/** Display labels used by the existing notifications UI. */
export type PlayerNotificationType =
  | "Profile Viewed"
  | "Saved by College"
  | "New Message"
  | "Profile Completion Reminder"
  | string;

export type PlayerNotification = {
  id: string;
  type: PlayerNotificationType;
  title: string;
  description: string;
  createdAt: string;
  unread: boolean;
  metadata?: Record<string, unknown> | null;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationTypeId;
  title: string;
  message: string;
  metadata?: Record<string, unknown> | null;
};

const STORAGE_TO_UI: Record<string, string> = {
  new_message: "New Message",
  player_saved: "Saved by College",
  profile_view: "Profile Viewed",
  reminder: "Profile Completion Reminder",
};

const UI_TO_STORAGE: Record<string, string> = {
  "New Message": "new_message",
  "Saved by College": "player_saved",
  "Profile Viewed": "profile_view",
  "Profile Completion Reminder": "reminder",
};

export function toUiNotificationType(type: string): PlayerNotificationType {
  return STORAGE_TO_UI[type] ?? type;
}

export function toStorageNotificationType(
  type: PlayerNotificationType,
): NotificationTypeId {
  return UI_TO_STORAGE[type] ?? type;
}

export function getNotificationHref(
  type: PlayerNotificationType,
  options?: {
    portal?: "player" | "college";
    metadata?: Record<string, unknown> | null;
  },
): string {
  const portal = options?.portal ?? "player";
  const metadata = options?.metadata ?? null;
  const conversationId =
    typeof metadata?.conversationId === "string"
      ? metadata.conversationId
      : null;
  const playerId =
    typeof metadata?.playerId === "string" ? metadata.playerId : null;

  if (portal === "college") {
    switch (type) {
      case "New Message":
      case "new_message":
        return conversationId
          ? `/college/messages?c=${encodeURIComponent(conversationId)}`
          : "/college/messages";
      case "Profile Completion Reminder":
      case "reminder":
        return playerId
          ? `/college/players/${encodeURIComponent(playerId)}`
          : "/college/players";
      default:
        return playerId
          ? `/college/players/${encodeURIComponent(playerId)}`
          : "/college/players";
    }
  }

  switch (type) {
    case "Profile Viewed":
    case "profile_view":
      return "/player/profile";
    case "Saved by College":
    case "player_saved":
      return "/player/colleges";
    case "New Message":
    case "new_message":
      return conversationId
        ? `/player/messages?c=${encodeURIComponent(conversationId)}`
        : "/player/messages";
    case "Profile Completion Reminder":
    case "reminder":
      return "/player/profile/edit";
    default:
      return "/player/notifications";
  }
}

export function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
