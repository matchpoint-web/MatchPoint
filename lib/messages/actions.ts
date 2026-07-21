"use server";

import type { ChatMessage, Conversation } from "@/lib/college-messages";
import {
  CONVERSATIONS_PER_PAGE,
  MESSAGES_PER_PAGE,
} from "@/lib/messages/queries";
import {
  getOrCreateConversation,
  listConversations,
  listMessages,
  sendMessage,
  type ConversationsPageResult,
  type MessagesPageResult,
} from "@/lib/messages-service";

export type ListConversationsActionInput = {
  page?: number;
  pageSize?: number;
};

export type ListMessagesActionInput = {
  conversationId: string;
  page?: number;
  pageSize?: number;
};

/** Load paginated inbox conversations for the current user. */
export async function listConversationsAction(
  input: ListConversationsActionInput = {},
): Promise<ConversationsPageResult> {
  const page =
    typeof input.page === "number" && Number.isFinite(input.page)
      ? Math.max(1, Math.floor(input.page))
      : 1;
  const pageSize =
    typeof input.pageSize === "number" && Number.isFinite(input.pageSize)
      ? Math.max(1, Math.floor(input.pageSize))
      : CONVERSATIONS_PER_PAGE;

  return listConversations({ page, pageSize });
}

/** Convenience action: first page of conversations as a flat list. */
export async function getConversationsAction(): Promise<Conversation[]> {
  const result = await listConversationsAction({
    page: 1,
    pageSize: CONVERSATIONS_PER_PAGE,
  });
  return result.conversations;
}

/** Load paginated chronological messages for a conversation. */
export async function listMessagesAction(
  input: ListMessagesActionInput,
): Promise<MessagesPageResult> {
  if (!input.conversationId?.trim()) {
    throw new Error("Conversation id is required.");
  }

  const page =
    typeof input.page === "number" && Number.isFinite(input.page)
      ? Math.max(1, Math.floor(input.page))
      : 1;
  const pageSize =
    typeof input.pageSize === "number" && Number.isFinite(input.pageSize)
      ? Math.max(1, Math.floor(input.pageSize))
      : MESSAGES_PER_PAGE;

  return listMessages({
    conversationId: input.conversationId.trim(),
    page,
    pageSize,
  });
}

/** Convenience action: first page of messages. */
export async function getMessagesAction(
  conversationId: string,
): Promise<ChatMessage[]> {
  const result = await listMessagesAction({ conversationId });
  return result.messages;
}

/** Send a message in a conversation the current user participates in. */
export async function sendMessageAction(
  conversationId: string,
  message: string,
): Promise<ChatMessage> {
  return sendMessage(conversationId, message);
}

/** College-only: get or create a conversation with a player. */
export async function getOrCreateConversationAction(
  playerId: string,
): Promise<string> {
  return getOrCreateConversation(playerId);
}
