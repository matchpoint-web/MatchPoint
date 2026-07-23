"use server";

import { revalidatePath } from "next/cache";
import type { ChatMessage, Conversation } from "@/lib/college-messages";
import { logError, serializeError } from "@/lib/errors";
import {
  CONVERSATIONS_PER_PAGE,
  MESSAGES_PER_PAGE,
} from "@/lib/messages/queries";
import {
  getConversationById,
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

export type OpenConversationResult =
  | {
      ok: true;
      conversationId: string;
      messages: ChatMessage[];
      conversations: Conversation[];
    }
  | {
      ok: false;
      conversationId: string;
      step:
        | "validate"
        | "listMessages"
        | "listConversations"
        | "getConversationById";
      error: ReturnType<typeof serializeError>;
    };

/** Dashboard / notification caches only — avoid revalidating the active messages page mid-open. */
function revalidateUnreadSurfaces() {
  revalidatePath("/college");
  revalidatePath("/college/dashboard");
  revalidatePath("/college/notifications");
  revalidatePath("/player");
  revalidatePath("/player/notifications");
}

function revalidateAfterSend() {
  revalidateUnreadSurfaces();
  revalidatePath("/college/messages");
  revalidatePath("/player/messages");
}

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

/**
 * Open a conversation: load messages (marks related notifications read), then inbox.
 * Returns a serializable result so clients are not stuck with opaque Next.js digests.
 */
export async function openConversationAction(
  conversationId: string,
): Promise<OpenConversationResult> {
  const trimmed = conversationId?.trim() ?? "";
  if (!trimmed) {
    return {
      ok: false,
      conversationId: "",
      step: "validate",
      error: serializeError(new Error("Conversation id is required.")),
    };
  }

  let messages: ChatMessage[] = [];

  try {
    const messagePage = await listMessages({
      conversationId: trimmed,
      page: 1,
      pageSize: MESSAGES_PER_PAGE,
    });
    messages = messagePage.messages;
  } catch (error) {
    const serialized = logError(
      "[messages] openConversationAction listMessages failed",
      error,
      { conversationId: trimmed, step: "listMessages" },
    );
    return {
      ok: false,
      conversationId: trimmed,
      step: "listMessages",
      error: serialized,
    };
  }

  let conversations: Conversation[] = [];

  try {
    const page = await listConversations({
      page: 1,
      pageSize: CONVERSATIONS_PER_PAGE,
    });
    conversations = page.conversations;
  } catch (error) {
    const serialized = logError(
      "[messages] openConversationAction listConversations failed",
      error,
      { conversationId: trimmed, step: "listConversations" },
    );
    return {
      ok: false,
      conversationId: trimmed,
      step: "listConversations",
      error: serialized,
    };
  }

  if (!conversations.some((conversation) => conversation.id === trimmed)) {
    try {
      const deepLinked = await getConversationById(trimmed);
      if (deepLinked) {
        conversations = [deepLinked, ...conversations];
      }
    } catch (error) {
      const serialized = logError(
        "[messages] openConversationAction getConversationById failed",
        error,
        { conversationId: trimmed, step: "getConversationById" },
      );
      return {
        ok: false,
        conversationId: trimmed,
        step: "getConversationById",
        error: serialized,
      };
    }
  }

  revalidateUnreadSurfaces();

  return {
    ok: true,
    conversationId: trimmed,
    messages,
    conversations,
  };
}

/** Send a message in a conversation the current user participates in. */
export async function sendMessageAction(
  conversationId: string,
  message: string,
): Promise<ChatMessage> {
  try {
    const chatMessage = await sendMessage(conversationId, message);
    revalidateAfterSend();
    return chatMessage;
  } catch (error) {
    logError("[messages] sendMessageAction failed", error, { conversationId });
    throw error;
  }
}

/** College-only: get or create a conversation with a player. */
export async function getOrCreateConversationAction(
  playerId: string,
): Promise<string> {
  return getOrCreateConversation(playerId);
}

/** Load one owned conversation (supports Messages deep link `?c=`). */
export async function getConversationByIdAction(
  conversationId: string,
): Promise<Conversation | null> {
  if (!conversationId?.trim()) {
    throw new Error("Conversation id is required.");
  }
  return getConversationById(conversationId.trim());
}
