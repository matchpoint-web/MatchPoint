export type CommunicationEventType =
  | "profile_viewed"
  | "player_saved"
  | "player_removed"
  | "message_sent"
  | "message_received"
  | "reminder_created"
  | "reminder_completed"
  | "invite_sent"
  | "invite_accepted"
  | "documents_downloaded"
  | "video_viewed"
  | "coach_notes_updated"
  | "email_sent"
  | "transcript_requested"
  | "scholarship_info_sent"
  | "campus_visit_invited"
  | "conversation_archived";

export type CommunicationEvent = {
  id: string;
  type: CommunicationEventType;
  title: string;
  description: string;
  timestamp: string;
  displayDate: string;
};

const eventIcons: Record<CommunicationEventType, string> = {
  profile_viewed: "👁",
  player_saved: "★",
  player_removed: "✕",
  message_sent: "✉",
  message_received: "💬",
  reminder_created: "⏰",
  reminder_completed: "✓",
  invite_sent: "📨",
  invite_accepted: "🤝",
  documents_downloaded: "📄",
  video_viewed: "▶",
  coach_notes_updated: "📝",
  email_sent: "✉",
  transcript_requested: "📄",
  scholarship_info_sent: "🎓",
  campus_visit_invited: "🏫",
  conversation_archived: "📦",
};

const HISTORY_STORAGE_KEY = "matchpoint-communication-history";

function readHistoryStore(): Record<string, CommunicationEvent[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CommunicationEvent[]>) : {};
  } catch {
    return {};
  }
}

function writeHistoryStore(data: Record<string, CommunicationEvent[]>) {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(data));
}

export function appendCommunicationEvent(
  playerId: string,
  event: Omit<CommunicationEvent, "id" | "timestamp" | "displayDate"> & {
    id?: string;
    timestamp?: string;
    displayDate?: string;
  },
) {
  if (typeof window === "undefined") return;

  const now = new Date();
  const entry: CommunicationEvent = {
    id: event.id ?? `evt-${Date.now()}`,
    type: event.type,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp ?? now.toISOString(),
    displayDate:
      event.displayDate ??
      now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
  };

  const store = readHistoryStore();
  store[playerId] = [entry, ...(store[playerId] ?? [])];
  writeHistoryStore(store);
}

export function getEventIcon(type: CommunicationEventType): string {
  return eventIcons[type];
}

export function getCommunicationHistory(
  playerId: string,
  playerName: string,
): CommunicationEvent[] {
  const histories: Record<string, CommunicationEvent[]> = {
    "1": [
      {
        id: "e1",
        type: "email_sent",
        title: "Email sent",
        description:
          "Coach Michael Rivera sent an introductory email.",
        timestamp: "2026-07-14T17:30:00",
        displayDate: "Today",
      },
      {
        id: "e2",
        type: "message_received",
        title: "Player replied",
        description:
          '"Thank you coach, I am interested in learning more."',
        timestamp: "2026-07-13T14:22:00",
        displayDate: "Jul 18, 2026",
      },
      {
        id: "e3",
        type: "profile_viewed",
        title: "Profile viewed",
        description: "Coach Michael Rivera viewed this profile.",
        timestamp: "2026-07-15T11:00:00",
        displayDate: "Jul 15, 2026",
      },
      {
        id: "e4",
        type: "player_saved",
        title: "Player saved to recruiting list",
        description: `${playerName} was added to your saved players.`,
        timestamp: "2026-07-12T16:45:00",
        displayDate: "Jul 12, 2026",
      },
      {
        id: "e5",
        type: "reminder_created",
        title: "Reminder created",
        description: "Follow up on Aug 1.",
        timestamp: "2026-07-05T10:15:00",
        displayDate: "Jul 5, 2026",
      },
    ],
  };

  const seeded = histories[playerId] ?? getDefaultHistory(playerName);
  const live = readHistoryStore()[playerId] ?? [];

  return [...live, ...seeded].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

function getDefaultHistory(playerName: string): CommunicationEvent[] {
  return [
    {
      id: "d1",
      type: "profile_viewed",
      title: "Profile viewed",
      description: "Coach staff viewed this profile.",
      timestamp: "2026-07-14T08:00:00",
      displayDate: "Today",
    },
    {
      id: "d2",
      type: "player_saved",
      title: "Player saved to recruiting list",
      description: `${playerName} was added to your saved players.`,
      timestamp: "2026-07-10T12:00:00",
      displayDate: "Jul 10, 2026",
    },
  ];
}

export function formatEventTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
