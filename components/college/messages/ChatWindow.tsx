"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  applyTemplate,
  formatMessageTime,
  messageTemplates,
  type ChatMessage,
  type Conversation,
  type MessageAttachmentType,
  type MessageTemplate,
} from "@/lib/college-messages";

type ChatWindowProps = {
  conversation: Conversation | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (body: string, attachmentType?: MessageAttachmentType) => void;
  onSave: () => void;
  onInvite: () => void;
  onArchive: () => void;
  onTemplateSelect: (template: MessageTemplate) => void;
};

function attachmentLabel(type?: MessageAttachmentType) {
  switch (type) {
    case "transcript_request":
      return "Transcript Request";
    case "scholarship_info":
      return "Scholarship Info";
    case "recruiting_invite":
      return "Recruiting Invite";
    default:
      return null;
  }
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.sender === "system") {
    return (
      <div className="flex justify-center py-2">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-500">
          {message.body}
        </span>
      </div>
    );
  }

  const isCoach = message.sender === "coach";
  const label = attachmentLabel(message.attachmentType);

  return (
    <div className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-3xl px-4 py-3 ${
          isCoach
            ? "rounded-br-lg bg-emerald-500 text-black"
            : "rounded-bl-lg border border-white/10 bg-zinc-800/90 text-zinc-100"
        }`}
      >
        {label && (
          <p
            className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${
              isCoach ? "text-black/60" : "text-emerald-400"
            }`}
          >
            {label}
          </p>
        )}
        <p className="text-sm leading-relaxed">{message.body}</p>
        <div
          className={`mt-1.5 flex items-center gap-2 text-[10px] ${
            isCoach ? "justify-end text-black/50" : "text-zinc-500"
          }`}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {isCoach && <span>{message.seen ? "Seen" : "Sent"}</span>}
        </div>
      </div>
    </div>
  );
}

export function ChatWindow({
  conversation,
  draft,
  onDraftChange,
  onSend,
  onSave,
  onInvite,
  onArchive,
  onTemplateSelect,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.id, conversation?.messages.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black/40">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-400">
            Select a conversation
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            Choose a player from the inbox to start messaging.
          </p>
        </div>
      </div>
    );
  }

  function handleSend() {
    const body = draft.trim();
    if (!body) return;
    onSend(body);
  }

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-black/30">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-emerald-400">
            {conversation.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {conversation.playerName}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {conversation.country} {conversation.countryFlag} · UTR{" "}
              {conversation.utr.toFixed(1)} · Class of{" "}
              {conversation.graduationYear}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            {conversation.recruitingStatus}
          </span>
          <Link
            href={`/college/players/${conversation.playerId}`}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition-colors hover:bg-white/10"
          >
            {conversation.isSaved ? "Saved" : "Save Player"}
          </button>
          <button
            type="button"
            onClick={onInvite}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
          >
            Invite
          </button>
          <button
            type="button"
            onClick={onArchive}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:bg-white/10"
          >
            Archive
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick templates */}
      <div className="border-t border-white/[0.06] px-4 py-3 sm:px-5">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
          Quick Templates
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {messageTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                onDraftChange(applyTemplate(template, conversation.playerName));
                onTemplateSelect(template);
              }}
              className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-white/[0.06] p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onSend(
                "Could you please upload your academic transcript?",
                "transcript_request",
              )
            }
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Attach Transcript Request
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                "Please find scholarship information attached regarding our program.",
                "scholarship_info",
              )
            }
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Attach Scholarship Info
          </button>
          <button
            type="button"
            onClick={() =>
              onSend(
                "You are invited to join our recruiting list. We look forward to continuing this conversation.",
                "recruiting_invite",
              )
            }
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Attach Recruiting Invite
          </button>
          <button
            type="button"
            onClick={() => onDraftChange(draft ? `${draft} 🎾` : "🎾")}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
            aria-label="Add emoji"
          >
            Emoji
          </button>
        </div>

        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type message..."
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-emerald-500/40"
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
