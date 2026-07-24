"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow, type MessagesViewerRole } from "./ChatWindow";
import { type Conversation } from "@/lib/college-messages";
import { logError } from "@/lib/errors";
import {
  getConversationByIdAction,
  getConversationsAction,
  openConversationAction,
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
  const [openError, setOpenError] = useState<string | null>(null);

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
    setOpenError(null);
    // Optimistic: clear badge immediately while server marks notifications read.
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );

    void (async () => {
      try {
        const result = await openConversationAction(id);

        if (!result.ok) {
          logError("[messages] failed to open conversation", result.error, {
            conversationId: id,
            step: result.step,
          });
          setOpenError(
            `${result.step}: ${result.error.message}` +
              (result.error.digest ? ` (digest ${result.error.digest})` : ""),
          );
          return;
        }

        setConversations(
          result.conversations.map((conversation) =>
            conversation.id === id
              ? {
                  ...conversation,
                  messages: result.messages,
                  lastMessage:
                    result.messages[result.messages.length - 1]?.body ??
                    conversation.lastMessage,
                  lastMessageAt:
                    result.messages[result.messages.length - 1]?.timestamp ??
                    conversation.lastMessageAt,
                  unreadCount: 0,
                }
              : conversation,
          ),
        );
      } catch (error) {
        // Unexpected client/runtime failures (network, non-result throws).
        const serialized = logError(
          "[messages] failed to open conversation",
          error,
          { conversationId: id, step: "client_openConversationAction" },
        );
        setOpenError(serialized.message);
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
              // Never mutate the server-action array (may be non-extensible).
              list = [deepLinked, ...list.filter((c) => c.id !== deepLinked.id)];
              setConversations(list);
            }
          }
          if (!cancelled) {
            selectConversation(initialConversationId);
          }
        }
      } catch (error) {
        logError("[messages] failed to load inbox", error, {
          initialConversationId,
        });
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
    } catch (error) {
      logError("[messages] failed to send message", error, {
        conversationId: active.id,
      });
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
        } h-full w-full lg:flex lg:w-[300px] lg:shrink-0`}
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
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {openError ? (
            <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-200">
              Could not fully open conversation — {openError}
            </div>
          ) : null}
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
    </div>
  );
}
