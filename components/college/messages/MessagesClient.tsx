"use client";

import { useMemo, useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import {
  mockConversations,
  type ChatMessage,
  type Conversation,
} from "@/lib/college-messages";

export function MessagesClient() {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const active = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );

  function selectConversation(id: string) {
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
  }

  function sendMessage(body: string) {
    if (!active) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: active.id,
      sender: "coach",
      body,
      timestamp: new Date().toISOString(),
      seen: false,
    };

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === active.id
          ? {
              ...conversation,
              lastMessage: body,
              lastMessageAt: message.timestamp,
              unreadCount: 0,
              messages: [...conversation.messages, message],
            }
          : conversation,
      ),
    );
    setDraft("");
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
        />
      </div>
    </div>
  );
}
