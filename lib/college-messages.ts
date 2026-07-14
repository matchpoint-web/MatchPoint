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

export const mockConversations: Conversation[] = [
  {
    id: "c1",
    playerId: "1",
    playerName: "Alex Tanaka",
    initials: "AT",
    country: "Japan",
    countryFlag: "🇯🇵",
    utr: 11.2,
    gpa: 3.8,
    graduationYear: "2027",
    division: "NCAA D1",
    englishTest: "TOEFL",
    recruitingStatus: "Interested",
    lastMessage: "Thank you Coach, I am interested in learning more.",
    lastMessageAt: "2026-07-14T14:20:00",
    unreadCount: 2,
    isSaved: true,
    isRecruitingList: true,
    isArchived: false,
    messages: [
      {
        id: "m1",
        conversationId: "c1",
        sender: "coach",
        body: "Hi Alex, I'm Coach Michael Rivera from Stanford. We've been following your results and would love to start a conversation about our program.",
        timestamp: "2026-07-12T10:00:00",
        seen: true,
      },
      {
        id: "m2",
        conversationId: "c1",
        sender: "player",
        body: "Thank you Coach, I am interested in learning more.",
        timestamp: "2026-07-13T14:22:00",
        seen: true,
      },
      {
        id: "m3",
        conversationId: "c1",
        sender: "coach",
        body: "Great to hear. Would you be open to a Zoom call next week?",
        timestamp: "2026-07-14T09:15:00",
        seen: true,
      },
      {
        id: "m4",
        conversationId: "c1",
        sender: "player",
        body: "Yes, Tuesday or Thursday after 5pm JST works well for me.",
        timestamp: "2026-07-14T14:20:00",
        seen: false,
      },
    ],
  },
  {
    id: "c2",
    playerId: "2",
    playerName: "Yuta Kikuchi",
    initials: "YK",
    country: "Japan",
    countryFlag: "🇯🇵",
    utr: 12.1,
    gpa: 3.6,
    graduationYear: "2026",
    division: "NCAA D1",
    englishTest: "TOEFL",
    recruitingStatus: "Contacted",
    lastMessage: "I've uploaded my latest highlight reel.",
    lastMessageAt: "2026-07-13T18:40:00",
    unreadCount: 1,
    isSaved: true,
    isRecruitingList: true,
    isArchived: false,
    messages: [
      {
        id: "m5",
        conversationId: "c2",
        sender: "coach",
        body: "Yuta, your ITF results look outstanding. Are you still targeting Division I programs for 2026?",
        timestamp: "2026-07-11T11:00:00",
        seen: true,
      },
      {
        id: "m6",
        conversationId: "c2",
        sender: "player",
        body: "Yes Coach. Stanford is high on my list. I've uploaded my latest highlight reel.",
        timestamp: "2026-07-13T18:40:00",
        seen: false,
      },
    ],
  },
  {
    id: "c3",
    playerId: "3",
    playerName: "Minho Kim",
    initials: "MK",
    country: "South Korea",
    countryFlag: "🇰🇷",
    utr: 10.8,
    gpa: 3.9,
    graduationYear: "2027",
    division: "NCAA D1",
    englishTest: "TOEFL",
    recruitingStatus: "Interested",
    lastMessage: "My TOEFL score is 108.",
    lastMessageAt: "2026-07-11T09:10:00",
    unreadCount: 0,
    isSaved: true,
    isRecruitingList: false,
    isArchived: false,
    messages: [
      {
        id: "m7",
        conversationId: "c3",
        sender: "coach",
        body: "Minho, could you share your latest English test results?",
        timestamp: "2026-07-10T16:00:00",
        seen: true,
      },
      {
        id: "m8",
        conversationId: "c3",
        sender: "player",
        body: "My TOEFL score is 108.",
        timestamp: "2026-07-11T09:10:00",
        seen: true,
      },
    ],
  },
  {
    id: "c4",
    playerId: "5",
    playerName: "Lucas Martinez",
    initials: "LM",
    country: "Spain",
    countryFlag: "🇪🇸",
    utr: 11.5,
    gpa: 3.5,
    graduationYear: "2027",
    division: "NCAA D1",
    englishTest: "Duolingo English Test",
    recruitingStatus: "Offer Sent",
    lastMessage: "Looking forward to reviewing the scholarship details.",
    lastMessageAt: "2026-07-09T20:05:00",
    unreadCount: 0,
    isSaved: false,
    isRecruitingList: true,
    isArchived: false,
    messages: [
      {
        id: "m9",
        conversationId: "c4",
        sender: "coach",
        body: "Lucas, we are preparing a scholarship offer outline. Happy to walk through the details with you and your family.",
        timestamp: "2026-07-08T13:00:00",
        seen: true,
        attachmentType: "scholarship_info",
      },
      {
        id: "m10",
        conversationId: "c4",
        sender: "player",
        body: "Looking forward to reviewing the scholarship details.",
        timestamp: "2026-07-09T20:05:00",
        seen: true,
      },
    ],
  },
  {
    id: "c5",
    playerId: "11",
    playerName: "Sofia Andersson",
    initials: "SA",
    country: "Sweden",
    countryFlag: "🇸🇪",
    utr: 11.8,
    gpa: 3.9,
    graduationYear: "2027",
    division: "NCAA D1",
    englishTest: "TOEFL",
    recruitingStatus: "Archived",
    lastMessage: "Conversation archived by staff.",
    lastMessageAt: "2026-06-28T12:00:00",
    unreadCount: 0,
    isSaved: false,
    isRecruitingList: false,
    isArchived: true,
    messages: [
      {
        id: "m11",
        conversationId: "c5",
        sender: "system",
        body: "Conversation archived by staff.",
        timestamp: "2026-06-28T12:00:00",
        seen: true,
      },
    ],
  },
];

export function formatRelativeTime(timestamp: string): string {
  const now = new Date("2026-07-14T16:00:00").getTime();
  const then = new Date(timestamp).getTime();
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
  return template.body.replace(/\{\{name\}\}/g, playerName.split(" ")[0] ?? playerName);
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
