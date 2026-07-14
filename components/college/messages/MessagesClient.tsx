"use client";

import { useMemo, useState } from "react";
import { ConversationList } from "./ConversationList";
import { ChatWindow } from "./ChatWindow";
import { PlayerQuickInfo } from "./PlayerQuickInfo";
import {
  logMessagingHistory,
  mockConversations,
  type ChatMessage,
  type Conversation,
  type ConversationFilter,
  type MessageAttachmentType,
  type MessageTemplate,
} from "@/lib/college-messages";

export function MessagesClient() {
  const [conversations, setConversations] =
    useState<Conversation[]>(mockConversations);
  const [activeId, setActiveId] = useState<string | null>(
    mockConversations.find((c) => !c.isArchived)?.id ?? null,
  );
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConversationFilter>("all");
  const [draft, setDraft] = useState("");
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const [pendingTemplate, setPendingTemplate] = useState<MessageTemplate | null>(
    null,
  );

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  function updateConversation(
    id: string,
    updater: (c: Conversation) => Conversation,
  ) {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updater(c) : c)),
    );
  }

  function selectConversation(id: string) {
    setActiveId(id);
    setMobileShowChat(true);
    setDraft("");
    setPendingTemplate(null);
    updateConversation(id, (c) => ({ ...c, unreadCount: 0 }));
  }

  function sendMessage(body: string, attachmentType?: MessageAttachmentType) {
    if (!active) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: active.id,
      sender: "coach",
      body,
      timestamp: new Date().toISOString(),
      seen: false,
      attachmentType,
    };

    updateConversation(active.id, (c) => ({
      ...c,
      lastMessage: body,
      lastMessageAt: message.timestamp,
      unreadCount: 0,
      isRecruitingList:
        attachmentType === "recruiting_invite" ? true : c.isRecruitingList,
      recruitingStatus:
        attachmentType === "recruiting_invite" && c.recruitingStatus === "Archived"
          ? "Contacted"
          : attachmentType === "recruiting_invite" && c.recruitingStatus === "Interested"
            ? "Contacted"
            : c.recruitingStatus,
      messages: [...c.messages, message],
    }));
    setDraft("");
    setPendingTemplate(null);

    if (attachmentType === "transcript_request") {
      logMessagingHistory(
        active.playerId,
        "transcript_requested",
        "Transcript requested",
        `Transcript request sent to ${active.playerName}.`,
      );
    } else if (attachmentType === "scholarship_info") {
      logMessagingHistory(
        active.playerId,
        "scholarship_info_sent",
        "Scholarship info sent",
        `Scholarship information shared with ${active.playerName}.`,
      );
    } else if (attachmentType === "recruiting_invite") {
      logMessagingHistory(
        active.playerId,
        "invite_sent",
        "Recruiting invite sent",
        `Recruiting invite sent to ${active.playerName}.`,
      );
    } else if (pendingTemplate?.historyType) {
      logMessagingHistory(
        active.playerId,
        pendingTemplate.historyType,
        pendingTemplate.historyTitle ?? pendingTemplate.label,
        `${pendingTemplate.label} sent to ${active.playerName}.`,
      );
    } else {
      logMessagingHistory(
        active.playerId,
        "message_sent",
        "Message sent",
        `Coach Michael Rivera messaged ${active.playerName}.`,
      );
    }
  }

  function handleSave() {
    if (!active) return;
    const nextSaved = !active.isSaved;
    updateConversation(active.id, (c) => ({ ...c, isSaved: nextSaved }));
    logMessagingHistory(
      active.playerId,
      nextSaved ? "player_saved" : "player_removed",
      nextSaved ? "Player saved" : "Removed from saved",
      nextSaved
        ? `${active.playerName} was saved to your list.`
        : `${active.playerName} was removed from saved players.`,
    );
  }

  function handleInvite() {
    if (!active) return;
    sendMessage(
      "You are invited to join our recruiting list. We look forward to continuing this conversation.",
      "recruiting_invite",
    );
  }

  function handleArchive() {
    if (!active) return;
    updateConversation(active.id, (c) => ({
      ...c,
      isArchived: true,
      recruitingStatus: "Archived",
      lastMessage: "Conversation archived by staff.",
    }));
    logMessagingHistory(
      active.playerId,
      "conversation_archived",
      "Conversation archived",
      `Conversation with ${active.playerName} was archived.`,
    );
    setActiveId(null);
    setMobileShowChat(false);
  }

  function handleTemplateSelect(template: MessageTemplate) {
    setPendingTemplate(template);
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] min-h-[560px] overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/50 shadow-2xl shadow-black/40 backdrop-blur-xl">
      {/* Sidebar */}
      <div
        className={`${
          mobileShowChat ? "hidden" : "flex"
        } h-full w-full lg:flex lg:w-[30%]`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          search={search}
          filter={filter}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onSelect={selectConversation}
        />
      </div>

      {/* Chat + Quick Info */}
      <div
        className={`${
          mobileShowChat ? "flex" : "hidden"
        } min-h-0 min-w-0 flex-1 lg:flex`}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {mobileShowChat && (
            <button
              type="button"
              onClick={() => setMobileShowChat(false)}
              className="border-b border-white/[0.06] px-4 py-2 text-left text-sm text-zinc-400 lg:hidden"
            >
              ← Back to inbox
            </button>
          )}
          <ChatWindow
            conversation={active}
            draft={draft}
            onDraftChange={setDraft}
            onSend={sendMessage}
            onSave={handleSave}
            onInvite={handleInvite}
            onArchive={handleArchive}
            onTemplateSelect={handleTemplateSelect}
          />
        </div>

        {active && (
          <PlayerQuickInfo conversation={active} onInvite={handleInvite} />
        )}
      </div>
    </div>
  );
}
