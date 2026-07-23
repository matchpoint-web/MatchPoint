"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow, type MessagesViewerRole } from "./ChatWindow";
import { type Conversation } from "@/lib/college-messages";
import {
  getConversationByIdAction,
  getConversationsAction,
  getMessagesAction,
  sendMessageAction,
} from "@/lib/messages/actions";

type MessagesClientProps = {
  initialConversationId?: string | null;
  viewerRole?: MessagesViewerRole;
};

const PLAYER_EMPTY_INBOX =
  "College coaches can contact you here.\nOnce a coach sends you a message, you can reply.";

export function MessagesClient({
  initialConversationId = null,
  viewerRole = "college",
}: MessagesClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );

  const appendMessage = useCallback(
    (conversationId: string, message: Conversation["messages"][number]) => {
      setConversations((prev) =>
        prev.map((conversation) => {
          if (conversation.id !== conversationId) return conversation;
          if (conversation.messages.some((existing) => existing.id === message.id)) {
            return conversation;
          }
          return {
            ...conversation,
            lastMessage: message.body,
            lastMessageAt: message.timestamp,
            unreadCount: 0,
            messages: [...conversation.messages, message],
          };
        }),
      );
    },
    [],
  );

  const selectConversation = useCallback((id: string) => {
    setActiveId(id);
    setMobileShowChat(true);
    setDraft("");
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );

    void (async () => {
      try {
        const [messages, list] = await Promise.all([
          getMessagesAction(id),
          getConversationsAction(),
        ]);

        setConversations(() =>
          list.map((conversation) =>
            conversation.id === id
              ? {
                  ...conversation,
                  messages,
                  lastMessage:
                    messages[messages.length - 1]?.body ??
                    conversation.lastMessage,
                  lastMessageAt:
                    messages[messages.length - 1]?.timestamp ??
                    conversation.lastMessageAt,
                  unreadCount: 0,
                }
              : conversation,
          ),
        );
      } catch {
        // Keep existing thread state if refresh fails.
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const next = await getConversationsAction();
        if (cancelled) return;
        setConversations(next);
        setLoaded(true);

        if (initialConversationId) {
          let list = next;
          if (!list.some((c) => c.id === initialConversationId)) {
            const deepLinked = await getConversationByIdAction(
              initialConversationId,
            );
            if (cancelled) return;
            if (deepLinked) {
              list = [
                deepLinked,
                ...list.filter((c) => c.id !== deepLinked.id),
              ];
              setConversations(list);
            }
          }
          if (!cancelled) {
            selectConversation(initialConversationId);
          }
        }
      } catch {
        if (!cancelled) {
          setConversations([]);
          setLoaded(true);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialConversationId, selectConversation]);

  async function sendMessage(body: string) {
    if (!active) return;

    try {
      const message = await sendMessageAction(active.id, body);
      appendMessage(active.id, message);
      setDraft("");
    } catch {
      // Keep draft so the user can retry.
    }
  }

  if (viewerRole === "player" && loaded && conversations.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[0.03] px-6 py-16 text-center">
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Messages
        </h2>
        <p className="mx-auto mt-3 max-w-md whitespace-pre-line text-sm text-zinc-500">
          {PLAYER_EMPTY_INBOX}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[560px] overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/50 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div
        className={`${
          mobileShowChat ? "hidden" : "flex"
        } h-full w-full lg:flex lg:w-[34%]`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          emptyMessage={
            viewerRole === "player" ? PLAYER_EMPTY_INBOX : "No conversations yet."
          }
        />
      </div>

      <div
        className={`${
          mobileShowChat ? "flex" : "hidden"
        } min-h-0 min-w-0 flex-1 lg:flex`}
      >
        <ChatWindow
          conversation={active}
          draft={draft}
          onDraftChange={setDraft}
          onSend={sendMessage}
          onBack={() => setMobileShowChat(false)}
          viewerRole={viewerRole}
        />
      </div>
    </div>
  );
}
