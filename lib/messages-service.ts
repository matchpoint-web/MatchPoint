import { isPlayerAccountSuspended } from "@/lib/auth/suspended";
import { getUserRole } from "@/lib/auth/utils";
import type {
  ChatMessage,
  Conversation,
  MessageSender,
  RecruitingStatus,
} from "@/lib/college-messages";
import { notifyNewMessage } from "@/lib/notifications-service";
import { createClient } from "@/lib/supabase/server";
import {
  flagForCountry,
  initialsFromName,
  toOptionalNumber,
} from "@/lib/players/mappers";
import {
  CONVERSATIONS_PER_PAGE,
  insertConversation,
  insertMessage,
  MESSAGES_PER_PAGE,
  queryConversationById,
  queryConversationIdBetween,
  queryConversationsPage,
  queryLatestMessagesForConversations,
  queryMessagesPage,
  queryCollegeIdForUser,
  queryPlayerIdForUser,
  type ConversationRow,
  type MessageRow,
  type MessagingAuthScope,
} from "@/lib/messages/queries";
import { queryCoachNoteStatuses } from "@/lib/coach-notes/queries";
import { querySavedPlayerIds } from "@/lib/saved-players/queries";

export type MessagesAuthContext =
  | { role: "college"; userId: string; collegeId: string; playerId: null }
  | { role: "player"; userId: string; collegeId: null; playerId: string };

export type ConversationsPageResult = {
  conversations: Conversation[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MessagesPageResult = {
  messages: ChatMessage[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ListConversationsParams = {
  page?: number;
  pageSize?: number;
};

export type ListMessagesParams = {
  conversationId: string;
  page?: number;
  pageSize?: number;
};

function unwrapPlayer(
  players: ConversationRow["players"],
): {
  id: string;
  full_name: string;
  nationality: string | null;
  graduation_year: number | null;
  utr: number | null;
  gpa: number | null;
  user_id: string | null;
} | null {
  if (!players) return null;
  return Array.isArray(players) ? (players[0] ?? null) : players;
}

function unwrapCollege(
  colleges: ConversationRow["colleges"],
): {
  id: string;
  school_name: string;
  location: string | null;
  division: string | null;
  user_id: string | null;
} | null {
  if (!colleges) return null;
  return Array.isArray(colleges) ? (colleges[0] ?? null) : colleges;
}

function mapSenderRole(role: string): MessageSender {
  if (role === "college") return "coach";
  if (role === "player") return "player";
  return "system";
}

export function mapMessageRow(row: MessageRow): ChatMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    sender: mapSenderRole(row.sender_role),
    body: row.message,
    timestamp: row.created_at,
    seen: true,
  };
}

function mapCoachStatusToRecruiting(status: string | undefined): RecruitingStatus {
  switch (status) {
    case "Recruiting":
    case "Interested":
      return "Interested";
    case "Follow Up":
      return "Contacted";
    case "Offered":
      return "Offer Sent";
    case "Signed":
      return "Committed";
    default:
      return "Contacted";
  }
}

async function requireAuthContext(): Promise<MessagesAuthContext> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  const role = getUserRole(user);

  if (role === "college") {
    const collegeId = await queryCollegeIdForUser(user.id);
    if (!collegeId) {
      throw new Error("College profile not found.");
    }
    return {
      role: "college",
      userId: user.id,
      collegeId,
      playerId: null,
    };
  }

  if (role === "player") {
    const playerId = await queryPlayerIdForUser(user.id);
    if (!playerId) {
      throw new Error("Player profile not found.");
    }
    return {
      role: "player",
      userId: user.id,
      collegeId: null,
      playerId,
    };
  }

  throw new Error("Unsupported account role for messaging.");
}

function toScope(ctx: MessagesAuthContext): MessagingAuthScope {
  if (ctx.role === "college") {
    return { role: "college", collegeId: ctx.collegeId, playerId: null };
  }
  return { role: "player", collegeId: null, playerId: ctx.playerId };
}

function buildConversationShell(
  row: ConversationRow,
  messages: ChatMessage[],
  extras: {
    viewerRole: "college" | "player";
    isSaved: boolean;
    recruitingStatus: RecruitingStatus;
    isRecruitingList: boolean;
    lastMessage: string;
    lastMessageAt: string;
  },
): Conversation {
  if (extras.viewerRole === "player") {
    const college = unwrapCollege(row.colleges);
    const name = college?.school_name?.trim() || "College Coach";
    const location = college?.location?.trim() || "";

    return {
      id: row.id,
      playerId: row.player_id,
      playerName: name,
      initials: initialsFromName(name),
      country: location,
      countryFlag: "",
      utr: null,
      gpa: null,
      graduationYear: "",
      division: college?.division?.trim() || null,
      recruitingStatus: extras.recruitingStatus,
      lastMessage: extras.lastMessage,
      lastMessageAt: extras.lastMessageAt,
      unreadCount: 0,
      isSaved: extras.isSaved,
      isRecruitingList: extras.isRecruitingList,
      isArchived: false,
      messages,
    };
  }

  const player = unwrapPlayer(row.players);
  const name = player?.full_name?.trim() || "Unnamed Player";
  const country = player?.nationality ?? "";

  return {
    id: row.id,
    playerId: row.player_id,
    playerName: name,
    initials: initialsFromName(name),
    country,
    countryFlag: flagForCountry(country),
    utr: toOptionalNumber(player?.utr),
    gpa: toOptionalNumber(player?.gpa),
    graduationYear:
      player?.graduation_year != null ? String(player.graduation_year) : "",
    division: null,
    recruitingStatus: extras.recruitingStatus,
    lastMessage: extras.lastMessage,
    lastMessageAt: extras.lastMessageAt,
    unreadCount: 0,
    isSaved: extras.isSaved,
    isRecruitingList: extras.isRecruitingList,
    isArchived: false,
    messages,
  };
}

function pickLatestAndHasCollegeMessage(rows: MessageRow[]): {
  latest: MessageRow | null;
  hasCollegeMessage: boolean;
} {
  let latest: MessageRow | null = null;
  let hasCollegeMessage = false;

  for (const row of rows) {
    if (!latest) latest = row;
    if (row.sender_role === "college") {
      hasCollegeMessage = true;
    }
  }

  return { latest, hasCollegeMessage };
}

/**
 * Paginated inbox conversations for the current user.
 * List rows include latest-message preview; full threads load via listMessages.
 */
export async function listConversations(
  params: ListConversationsParams = {},
): Promise<ConversationsPageResult> {
  const ctx = await requireAuthContext();
  const pageSize = params.pageSize ?? CONVERSATIONS_PER_PAGE;
  const page = params.page ?? 1;

  const { rows, totalCount, page: resolvedPage, pageSize: resolvedSize } =
    await queryConversationsPage({
      scope: toScope(ctx),
      page,
      pageSize,
    });

  if (rows.length === 0) {
    return {
      conversations: [],
      totalCount,
      page: resolvedPage,
      pageSize: resolvedSize,
      totalPages: Math.max(1, Math.ceil(totalCount / resolvedSize)),
    };
  }

  const conversationIds = rows.map((row) => row.id);
  const playerIds = [...new Set(rows.map((row) => row.player_id))];

  const latestRows = await queryLatestMessagesForConversations(conversationIds);
  const messagesByConversation = new Map<string, MessageRow[]>();
  for (const row of latestRows) {
    const list = messagesByConversation.get(row.conversation_id) ?? [];
    list.push(row);
    messagesByConversation.set(row.conversation_id, list);
  }

  let savedIds = new Set<string>();
  let noteStatusByPlayer = new Map<string, string>();

  if (ctx.role === "college") {
    const [saved, notes] = await Promise.all([
      querySavedPlayerIds(ctx.collegeId, playerIds),
      queryCoachNoteStatuses(ctx.collegeId, playerIds),
    ]);
    savedIds = new Set(saved);
    noteStatusByPlayer = notes;
  }

  const conversations = rows
    .map((row) => {
      const threadRows = messagesByConversation.get(row.id) ?? [];
      const { latest, hasCollegeMessage } =
        pickLatestAndHasCollegeMessage(threadRows);

      // Players only see threads after a coach has sent at least one message.
      if (ctx.role === "player" && !hasCollegeMessage) {
        return null;
      }

      const status = noteStatusByPlayer.get(row.player_id);
      const recruitingStatus = mapCoachStatusToRecruiting(status);
      return buildConversationShell(row, [], {
        viewerRole: ctx.role,
        isSaved: savedIds.has(row.player_id),
        recruitingStatus,
        isRecruitingList:
          recruitingStatus === "Interested" ||
          recruitingStatus === "Contacted" ||
          recruitingStatus === "Offer Sent",
        lastMessage: latest?.message ?? "",
        lastMessageAt: latest?.created_at ?? row.updated_at ?? row.created_at,
      });
    })
    .filter((conversation): conversation is Conversation => conversation != null);

  conversations.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  return {
    conversations,
    totalCount,
    page: resolvedPage,
    pageSize: resolvedSize,
    totalPages: Math.max(1, Math.ceil(totalCount / resolvedSize)),
  };
}

/** Convenience: first page of conversations (existing call sites). */
export async function getConversations(): Promise<Conversation[]> {
  const result = await listConversations({
    page: 1,
    pageSize: CONVERSATIONS_PER_PAGE,
  });
  return result.conversations;
}

/** Paginated chronological messages for a conversation. */
export async function listMessages(
  params: ListMessagesParams,
): Promise<MessagesPageResult> {
  await requireAuthContext();

  const pageSize = params.pageSize ?? MESSAGES_PER_PAGE;
  const page = params.page ?? 1;
  const { rows, totalCount, page: resolvedPage, pageSize: resolvedSize } =
    await queryMessagesPage({
      conversationId: params.conversationId,
      page,
      pageSize,
    });

  return {
    messages: rows.map(mapMessageRow),
    totalCount,
    page: resolvedPage,
    pageSize: resolvedSize,
    totalPages: Math.max(1, Math.ceil(totalCount / resolvedSize)),
  };
}

/** Convenience: first page of messages for a conversation. */
export async function getMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  const result = await listMessages({
    conversationId,
    page: 1,
    pageSize: MESSAGES_PER_PAGE,
  });
  return result.messages;
}

/** Send a message as the current player or college user. */
export async function sendMessage(
  conversationId: string,
  message: string,
): Promise<ChatMessage> {
  const body = message.trim();
  if (!body) {
    throw new Error("Message cannot be empty.");
  }
  if (!conversationId) {
    throw new Error("Conversation id is required.");
  }

  const ctx = await requireAuthContext();
  if (ctx.role === "player") {
    const suspended = await isPlayerAccountSuspended(ctx.userId);
    if (suspended) {
      throw new Error("Your account has been suspended.");
    }
  }
  const senderRole = ctx.role === "college" ? "college" : "player";

  const row = await insertMessage({
    conversationId,
    senderUserId: ctx.userId,
    senderRole,
    message: body,
  });

  const chatMessage = mapMessageRow(row);

  try {
    await notifyMessageReceiver({
      conversationId,
      senderRole,
      messageBody: body,
      messageId: chatMessage.id,
    });
  } catch {
    // Message delivery must not fail if notification creation fails.
  }

  return chatMessage;
}

async function notifyMessageReceiver(input: {
  conversationId: string;
  senderRole: "player" | "college";
  messageBody: string;
  messageId: string;
}): Promise<void> {
  const conversation = await queryConversationById(input.conversationId);
  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const player = unwrapPlayer(conversation.players);
  const college = unwrapCollege(conversation.colleges);

  const receiverUserId =
    input.senderRole === "college" ? player?.user_id : college?.user_id;
  if (!receiverUserId) {
    throw new Error("Receiver user id not found.");
  }

  const senderLabel =
    input.senderRole === "college"
      ? college?.school_name?.trim() || "a college coach"
      : player?.full_name?.trim() || "a player";

  await notifyNewMessage({
    receiverUserId,
    senderLabel,
    messageBody: input.messageBody,
    conversationId: input.conversationId,
    messageId: input.messageId,
  });
}

/**
 * Get or create the unique conversation between the current college and a player.
 */
export async function getOrCreateConversation(
  playerId: string,
): Promise<string> {
  if (!playerId) {
    throw new Error("Player id is required.");
  }

  const ctx = await requireAuthContext();
  if (ctx.role !== "college") {
    throw new Error("Only colleges can start conversations with players.");
  }

  const existing = await queryConversationIdBetween(ctx.collegeId, playerId);
  if (existing) return existing;

  return insertConversation({
    collegeId: ctx.collegeId,
    playerId,
  });
}
