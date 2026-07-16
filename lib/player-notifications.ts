export type PlayerNotificationType =
  | "Profile Viewed"
  | "Saved by College"
  | "New Message"
  | "Profile Completion Reminder";

export type PlayerNotification = {
  id: string;
  type: PlayerNotificationType;
  title: string;
  description: string;
  createdAt: string;
  unread: boolean;
};

export const mockPlayerNotifications: PlayerNotification[] = [
  {
    id: "pn1",
    type: "Profile Viewed",
    title: "Stanford University viewed your profile",
    description:
      "A college coach recently reviewed your recruiting profile.",
    createdAt: "2026-07-16T12:30:00.000Z",
    unread: true,
  },
  {
    id: "pn2",
    type: "Saved by College",
    title: "UCLA saved your profile",
    description:
      "You were added to a college recruiting watch list.",
    createdAt: "2026-07-16T09:10:00.000Z",
    unread: true,
  },
  {
    id: "pn3",
    type: "New Message",
    title: "New message from University of Texas",
    description:
      "A coach sent you a recruiting message. Open Messages to reply.",
    createdAt: "2026-07-15T18:45:00.000Z",
    unread: true,
  },
  {
    id: "pn4",
    type: "Profile Completion Reminder",
    title: "Complete your recruiting profile",
    description:
      "Add missing details to improve your visibility to college coaches.",
    createdAt: "2026-07-14T11:00:00.000Z",
    unread: false,
  },
  {
    id: "pn5",
    type: "Profile Viewed",
    title: "University of Florida viewed your profile",
    description: "Your profile appeared in a college coach search.",
    createdAt: "2026-07-13T16:20:00.000Z",
    unread: false,
  },
];

export function getNotificationHref(
  type: PlayerNotificationType,
): string {
  switch (type) {
    case "Profile Viewed":
      return "/player/profile";
    case "Saved by College":
      return "/player/colleges";
    case "New Message":
      return "/player/messages";
    case "Profile Completion Reminder":
      return "/player/profile/edit";
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
