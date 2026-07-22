/** Display status on conversation list cards (mapped from coach notes). */
export type RecruitingStatus =
  | "Interested"
  | "Contacted"
  | "Offer Sent"
  | "Committed"
  | "Archived";

export type MessageSender = "coach" | "player" | "system";

export type MessageAttachmentType =
  | "transcript_request"
  | "scholarship_info"
  | "recruiting_invite"
  | "none";

export type ChatMessage = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  body: string;
  timestamp: string;
  seen: boolean;
  attachmentType?: MessageAttachmentType;
};

export type Conversation = {
  id: string;
  playerId: string;
  playerName: string;
  initials: string;
  country: string;
  countryFlag: string;
  utr: number | null;
  gpa: number | null;
  graduationYear: string;
  /** College division when viewing as a player; null when unknown. */
  division: string | null;
  recruitingStatus: RecruitingStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isSaved: boolean;
  isRecruitingList: boolean;
  isArchived: boolean;
  messages: ChatMessage[];
};

export function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  if (Number.isNaN(then)) return "";

  const diffMin = Math.max(0, Math.floor((now - then) / 60000));

  if (diffMin < 60) return `${diffMin}m ago`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatMessageTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
