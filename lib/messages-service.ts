import { createClient } from "@/lib/supabase/client";
import type { PreferredDivision } from "@/lib/mock-players";
import type { RecruitingStatus } from "@/lib/coach-crm";
import type {
  ChatMessage,
  Conversation,
  MessageSender,
} from "@/lib/college-messages";
import { notifyNewMessage } from "@/lib/notifications-service";

type SenderRole = "player" | "college";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  sender_role: string;
  message: string;
  created_at: string;
};

type PlayerEmbed = {
  id: string;
  full_name: string | null;
  nationality: string | null;
  graduation_year: number | null;
  utr: number | string | null;
  gpa: number | string | null;
};

type CollegeEmbed = {
  id: string;
  school_name: string | null;
  location: string | null;
  division: string | null;
};

type ConversationRow = {
  id: string;
  player_id: string;
  college_id: string;
  created_at: string;
  players: PlayerEmbed | PlayerEmbed[] | null;
  colleges: CollegeEmbed | CollegeEmbed[] | null;
};

type AuthContext =
  | { role: "college"; userId: string; collegeId: string; playerId: null }
  | { role: "player"; userId: string; collegeId: null; playerId: string };

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Peru: "🇵🇪",
  "United Kingdom": "🇬🇧",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Switzerland: "🇨🇭",
  "Czech Republic": "🇨🇿",
  Serbia: "🇷🇸",
  Croatia: "🇭🇷",
  Poland: "🇵🇱",
  Austria: "🇦🇹",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  "Chinese Taipei": "🇹🇼",
  "Hong Kong": "🇭🇰",
  Thailand: "🇹🇭",
  Malaysia: "🇲🇾",
  Singapore: "🇸🇬",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  India: "🇮🇳",
  Vietnam: "🇻🇳",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  "South Africa": "🇿🇦",
  Morocco: "🇲🇦",
  Egypt: "🇪🇬",
  Ireland: "🇮🇪",
};

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function flagForCountry(country: string): string {
  if (!country) return "";
  return COUNTRY_FLAGS[country] ?? "";
}

function unwrapPlayer(
  players: PlayerEmbed | PlayerEmbed[] | null,
): PlayerEmbed | null {
  if (!players) return null;
  return Array.isArray(players) ? (players[0] ?? null) : players;
}

function unwrapCollege(
  colleges: CollegeEmbed | CollegeEmbed[] | null,
): CollegeEmbed | null {
  if (!colleges) return null;
  return Array.isArray(colleges) ? (colleges[0] ?? null) : colleges;
}

function mapSenderRole(role: string): MessageSender {
  if (role === "college") return "coach";
  if (role === "player") return "player";
  return "system";
}

function mapMessageRow(row: MessageRow): ChatMessage {
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

async function requireAuthContext(): Promise<AuthContext> {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Not authenticated");
  }

  const role =
    typeof user.user_metadata?.role === "string"
      ? user.user_metadata.role
      : null;

  if (role === "college") {
    const { data: college, error: collegeError } = await supabase
      .from("colleges")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (collegeError) {
      throw new Error(collegeError.message);
    }

    if (!college?.id) {
      throw new Error("College profile not found.");
    }

    return {
      role: "college",
      userId: user.id,
      collegeId: college.id as string,
      playerId: null,
    };
  }

  if (role === "player") {
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (playerError) {
      throw new Error(playerError.message);
    }

    if (!player?.id) {
      throw new Error("Player profile not found.");
    }

    return {
      role: "player",
      userId: user.id,
      collegeId: null,
      playerId: player.id as string,
    };
  }

  throw new Error("Unsupported account role for messaging.");
}

function buildConversationShell(
  row: ConversationRow,
  messages: ChatMessage[],
  extras: {
    viewerRole: "college" | "player";
    isSaved: boolean;
    recruitingStatus: RecruitingStatus;
    isRecruitingList: boolean;
  },
): Conversation {
  const last = messages[messages.length - 1];

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
      utr: 0,
      gpa: 0,
      graduationYear: college?.division?.trim() || "",
      division: "NCAA D1" as PreferredDivision,
      englishTest: "",
      recruitingStatus: extras.recruitingStatus,
      lastMessage: last?.body ?? "",
      lastMessageAt: last?.timestamp ?? row.created_at,
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
    utr: toNumber(player?.utr),
    gpa: toNumber(player?.gpa),
    graduationYear:
      player?.graduation_year != null ? String(player.graduation_year) : "",
    division: "NCAA D1" as PreferredDivision,
    englishTest: "",
    recruitingStatus: extras.recruitingStatus,
    lastMessage: last?.body ?? "",
    lastMessageAt: last?.timestamp ?? row.created_at,
    unreadCount: 0,
    isSaved: extras.isSaved,
    isRecruitingList: extras.isRecruitingList,
    isArchived: false,
    messages,
  };
}

/**
 * Conversations for the current college or player account.
 * College view is enriched with player profile fields for the existing inbox UI.
 */
export async function getConversations(): Promise<Conversation[]> {
  const ctx = await requireAuthContext();
  const supabase = createClient();

  let query = supabase.from("conversations").select(
    `
      id,
      player_id,
      college_id,
      created_at,
      players (
        id,
        full_name,
        nationality,
        graduation_year,
        utr,
        gpa
      ),
      colleges (
        id,
        school_name,
        location,
        division
      )
    `,
  );

  if (ctx.role === "college") {
    query = query.eq("college_id", ctx.collegeId);
  } else {
    query = query.eq("player_id", ctx.playerId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data as ConversationRow[] | null) ?? [];
  if (rows.length === 0) return [];

  const conversationIds = rows.map((row) => row.id);
  const playerIds = [...new Set(rows.map((row) => row.player_id))];

  const { data: messageData, error: messageError } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_user_id, sender_role, message, created_at",
    )
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: true });

  if (messageError) {
    throw new Error(messageError.message);
  }

  const messagesByConversation = new Map<string, ChatMessage[]>();
  for (const row of (messageData as MessageRow[] | null) ?? []) {
    const list = messagesByConversation.get(row.conversation_id) ?? [];
    list.push(mapMessageRow(row));
    messagesByConversation.set(row.conversation_id, list);
  }

  const savedIds = new Set<string>();
  const noteStatusByPlayer = new Map<string, string>();

  if (ctx.role === "college") {
    const [{ data: saved }, { data: notes }] = await Promise.all([
      supabase
        .from("saved_players")
        .select("player_id")
        .eq("college_id", ctx.collegeId)
        .in("player_id", playerIds),
      supabase
        .from("coach_notes")
        .select("player_id, status")
        .eq("college_id", ctx.collegeId)
        .in("player_id", playerIds),
    ]);

    for (const row of saved ?? []) {
      if (row?.player_id) savedIds.add(row.player_id as string);
    }
    for (const row of notes ?? []) {
      if (row?.player_id) {
        noteStatusByPlayer.set(row.player_id as string, row.status as string);
      }
    }
  }

  const conversations = rows
    .map((row) => {
      const messages = messagesByConversation.get(row.id) ?? [];
      // Players only see threads after a coach has sent at least one message.
      if (ctx.role === "player" && messages.length === 0) {
        return null;
      }

      const status = noteStatusByPlayer.get(row.player_id);
      const recruitingStatus = mapCoachStatusToRecruiting(status);
      return buildConversationShell(row, messages, {
        viewerRole: ctx.role,
        isSaved: savedIds.has(row.player_id),
        recruitingStatus,
        isRecruitingList:
          recruitingStatus === "Interested" ||
          recruitingStatus === "Contacted" ||
          recruitingStatus === "Offer Sent",
      });
    })
    .filter((conversation): conversation is Conversation => conversation != null);

  conversations.sort(
    (a, b) =>
      new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  return conversations;
}

/** Messages for a conversation the current user can access. */
export async function getMessages(
  conversationId: string,
): Promise<ChatMessage[]> {
  if (!conversationId) {
    throw new Error("Conversation id is required.");
  }

  await requireAuthContext();
  const supabase = createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, conversation_id, sender_user_id, sender_role, message, created_at",
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as MessageRow[] | null) ?? []).map(mapMessageRow);
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
  const supabase = createClient();
  const senderRole: SenderRole = ctx.role === "college" ? "college" : "player";

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_user_id: ctx.userId,
      sender_role: senderRole,
      message: body,
    })
    .select(
      "id, conversation_id, sender_user_id, sender_role, message, created_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const chatMessage = mapMessageRow(data as MessageRow);

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
  senderRole: SenderRole;
  messageBody: string;
  messageId: string;
}): Promise<void> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      players ( user_id, full_name ),
      colleges ( user_id, school_name )
    `,
    )
    .eq("id", input.conversationId)
    .maybeSingle();

  if (error || !data) {
    throw new Error(error?.message ?? "Conversation not found.");
  }

  const players = data.players as
    | { user_id: string | null; full_name: string | null }
    | { user_id: string | null; full_name: string | null }[]
    | null;
  const colleges = data.colleges as
    | { user_id: string | null; school_name: string | null }
    | { user_id: string | null; school_name: string | null }[]
    | null;

  const player = Array.isArray(players) ? players[0] : players;
  const college = Array.isArray(colleges) ? colleges[0] : colleges;

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
 * Subscribe to new messages in a conversation (Supabase Realtime).
 * Returns an unsubscribe function.
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: ChatMessage) => void,
): () => void {
  if (!conversationId) {
    return () => {};
  }

  const supabase = createClient();
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as MessageRow;
        if (!row?.id) return;
        onMessage(mapMessageRow(row));
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

/**
 * Get or create the unique conversation between the current college and a player.
 * Used when starting a thread from recruiting flows.
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

  const supabase = createClient();

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("college_id", ctx.collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.id) {
    return existing.id as string;
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      college_id: ctx.collegeId,
      player_id: playerId,
    })
    .select("id")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created.id as string;
}
