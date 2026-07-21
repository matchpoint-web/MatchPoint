import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export const CONVERSATIONS_PER_PAGE = 30;
export const MESSAGES_PER_PAGE = 100;

export type MessageRow = Tables<"messages">;

export type PlayerEmbed = Pick<
  Tables<"players">,
  "id" | "full_name" | "nationality" | "graduation_year" | "utr" | "gpa" | "user_id"
>;

export type CollegeEmbed = Pick<
  Tables<"colleges">,
  "id" | "school_name" | "location" | "division" | "user_id"
>;

/** Conversation list row including joined player/college embeds. */
export type ConversationRow = Pick<
  Tables<"conversations">,
  "id" | "player_id" | "college_id" | "created_at" | "updated_at"
> & {
  players: PlayerEmbed | PlayerEmbed[] | null;
  colleges: CollegeEmbed | CollegeEmbed[] | null;
};

const CONVERSATION_SELECT = `
  id,
  player_id,
  college_id,
  created_at,
  updated_at,
  players (
    id,
    full_name,
    nationality,
    graduation_year,
    utr,
    gpa,
    user_id
  ),
  colleges (
    id,
    school_name,
    location,
    division,
    user_id
  )
` as const;

const MESSAGE_SELECT =
  "id, conversation_id, sender_user_id, sender_role, message, created_at" as const;

export type MessagingAuthScope =
  | { role: "college"; collegeId: string; playerId: null }
  | { role: "player"; collegeId: null; playerId: string };

export type ConversationsPageQueryInput = {
  scope: MessagingAuthScope;
  page?: number;
  pageSize?: number;
};

export type ConversationsPageQueryResult = {
  rows: ConversationRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type MessagesPageQueryInput = {
  conversationId: string;
  page?: number;
  pageSize?: number;
};

export type MessagesPageQueryResult = {
  rows: MessageRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

function normalizePage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1) || 1);
}

function normalizePageSize(
  pageSize: number | undefined,
  fallback: number,
): number {
  return pageSize && pageSize > 0 ? Math.floor(pageSize) : fallback;
}

/**
 * Paginated conversations for the authenticated college or player.
 * RLS still enforces access; scope filters to the owned account row.
 */
export async function queryConversationsPage(
  input: ConversationsPageQueryInput,
): Promise<ConversationsPageQueryResult> {
  const pageSize = normalizePageSize(
    input.pageSize,
    CONVERSATIONS_PER_PAGE,
  );
  const page = normalizePage(input.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();

  let query = supabase
    .from("conversations")
    .select(CONVERSATION_SELECT, { count: "exact" });

  if (input.scope.role === "college") {
    query = query.eq("college_id", input.scope.collegeId);
  } else {
    query = query.eq("player_id", input.scope.playerId);
  }

  const { data, error, count } = await query
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data as ConversationRow[] | null) ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

/**
 * Latest messages for many conversations (for inbox previews).
 * Ordered newest-first; callers pick the first row per conversation.
 */
export async function queryLatestMessagesForConversations(
  conversationIds: string[],
): Promise<MessageRow[]> {
  if (conversationIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .in("conversation_id", conversationIds)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as MessageRow[] | null) ?? [];
}

/**
 * Paginated messages for one conversation, chronological (oldest → newest).
 */
export async function queryMessagesPage(
  input: MessagesPageQueryInput,
): Promise<MessagesPageQueryResult> {
  if (!input.conversationId) {
    throw new Error("Conversation id is required.");
  }

  const pageSize = normalizePageSize(input.pageSize, MESSAGES_PER_PAGE);
  const page = normalizePage(input.page);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT, { count: "exact" })
    .eq("conversation_id", input.conversationId)
    .order("created_at", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data as MessageRow[] | null) ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export async function insertMessage(input: {
  conversationId: string;
  senderUserId: string;
  senderRole: "player" | "college";
  message: string;
}): Promise<MessageRow> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: input.conversationId,
      sender_user_id: input.senderUserId,
      sender_role: input.senderRole,
      message: input.message,
    })
    .select(MESSAGE_SELECT)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as MessageRow;
}

export async function queryConversationById(
  conversationId: string,
): Promise<ConversationRow | null> {
  if (!conversationId) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(CONVERSATION_SELECT)
    .eq("id", conversationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as ConversationRow | null) ?? null;
}

export async function queryConversationIdBetween(
  collegeId: string,
  playerId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("college_id", collegeId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function insertConversation(input: {
  collegeId: string;
  playerId: string;
}): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      college_id: input.collegeId,
      player_id: input.playerId,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id;
}

export async function querySavedPlayerIds(
  collegeId: string,
  playerIds: string[],
): Promise<string[]> {
  if (playerIds.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_players")
    .select("player_id")
    .eq("college_id", collegeId)
    .in("player_id", playerIds);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => row.player_id)
    .filter((id): id is string => typeof id === "string");
}

export async function queryCoachNoteStatuses(
  collegeId: string,
  playerIds: string[],
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (playerIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coach_notes")
    .select("player_id, status")
    .eq("college_id", collegeId)
    .in("player_id", playerIds);

  if (error) {
    throw new Error(error.message);
  }

  for (const row of data ?? []) {
    if (row.player_id && typeof row.status === "string") {
      result.set(row.player_id, row.status);
    }
  }

  return result;
}

export async function queryCollegeIdForUser(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function queryPlayerIdForUser(
  userId: string,
): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}
