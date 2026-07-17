import type { PreferredDivision } from "./mock-players";
import type { RecruitingStatus } from "./coach-crm";
import {
  appendCommunicationEvent,
  type CommunicationEventType,
} from "./communication-history";

export type ConversationFilter =
  | "all"
  | "unread"
  | "saved"
  | "recruiting"
  | "archived";

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
  utr: number;
  gpa: number;
  graduationYear: string;
  division: PreferredDivision;
  englishTest: string;
  recruitingStatus: RecruitingStatus;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isSaved: boolean;
  isRecruitingList: boolean;
  isArchived: boolean;
  messages: ChatMessage[];
};

export type MessageTemplate = {
  id: string;
  label: string;
  body: string;
  historyType?: CommunicationEventType;
  historyTitle?: string;
};

export const conversationFilters: {
  value: ConversationFilter;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "saved", label: "Saved Players" },
  { value: "recruiting", label: "Recruiting List" },
  { value: "archived", label: "Archived" },
];

export const messageTemplates: MessageTemplate[] = [
  {
    id: "introduce",
    label: "Introduce Program",
    body: "Hi {{name}}, I'm Coach Michael Rivera from Stanford University. We're impressed by your profile and would love to introduce you to our tennis program and academic opportunities.",
    historyType: "message_sent",
    historyTitle: "Program introduction sent",
  },
  {
    id: "zoom",
    label: "Schedule Zoom Call",
    body: "Hi {{name}}, would you be available for a Zoom call this week to discuss our program, roster plans, and how you might fit into our team?",
    historyType: "message_sent",
    historyTitle: "Zoom call invitation sent",
  },
  {
    id: "transcript",
    label: "Request Transcript",
    body: "Hi {{name}}, could you please upload your most recent academic transcript so we can continue the evaluation process?",
    historyType: "transcript_requested",
    historyTitle: "Transcript requested",
  },
  {
    id: "sat-act",
    label: "Request SAT/ACT",
    body: "Hi {{name}}, please share your latest SAT or ACT scores when you have a moment. This helps our admissions and coaching staff review your academic fit.",
    historyType: "message_sent",
    historyTitle: "SAT/ACT request sent",
  },
  {
    id: "tournament",
    label: "Ask Tournament Schedule",
    body: "Hi {{name}}, could you share your upcoming tournament schedule? We'd like to follow your matches and potentially attend in person.",
    historyType: "message_sent",
    historyTitle: "Tournament schedule requested",
  },
  {
    id: "campus",
    label: "Invite Campus Visit",
    body: "Hi {{name}}, we'd love to invite you for a campus visit. Please let us know a few dates that work and we'll arrange a tour of facilities and meetings with our staff.",
    historyType: "campus_visit_invited",
    historyTitle: "Campus visit invited",
  },
  {
    id: "congratulate",
    label: "Congratulate Tournament Result",
    body: "Hi {{name}}, congratulations on your recent tournament result! Your performance stood out and we wanted to personally recognize your hard work.",
    historyType: "message_sent",
    historyTitle: "Congratulatory message sent",
  },
];

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

export function applyTemplate(
  template: MessageTemplate,
  playerName: string,
): string {
  return template.body.replace(
    /\{\{name\}\}/g,
    playerName.split(" ")[0] ?? playerName,
  );
}

export function logMessagingHistory(
  playerId: string,
  type: CommunicationEventType,
  title: string,
  description: string,
) {
  appendCommunicationEvent(playerId, { type, title, description });
}

export function filterConversations(
  conversations: Conversation[],
  filter: ConversationFilter,
  query: string,
): Conversation[] {
  const q = query.trim().toLowerCase();

  return conversations.filter((c) => {
    if (filter === "unread" && c.unreadCount === 0) return false;
    if (filter === "saved" && !c.isSaved) return false;
    if (filter === "recruiting" && !c.isRecruitingList) return false;
    if (filter === "archived" && !c.isArchived) return false;
    if (filter !== "archived" && c.isArchived) return false;
    if (
      q &&
      !c.playerName.toLowerCase().includes(q) &&
      !c.country.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}
