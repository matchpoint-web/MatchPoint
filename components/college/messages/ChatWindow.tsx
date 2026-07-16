"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  formatMessageTime,
  type ChatMessage,
  type Conversation,
} from "@/lib/college-messages";

type ChatWindowProps = {
  conversation: Conversation | null;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (body: string) => void;
  onBack?: () => void;
};

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

  return (
    <div className={`flex ${isCoach ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-3xl px-4 py-3 sm:max-w-[75%] ${
          isCoach
            ? "rounded-br-lg bg-emerald-500 text-black"
            : "rounded-bl-lg border border-white/10 bg-zinc-800/90 text-zinc-100"
        }`}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
          {isCoach ? "Coach" : "Player"}
        </p>
        <p className="text-sm leading-relaxed">{message.body}</p>
        <p
          className={`mt-1.5 text-[10px] ${
            isCoach ? "text-right text-black/50" : "text-zinc-500"
          }`}
        >
          {formatMessageTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

export function ChatWindow({
  conversation,
  draft,
  onDraftChange,
  onSend,
  onBack,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.id, conversation?.messages.length]);

  if (!conversation) {
    return (
      <div className="flex flex-1 items-center justify-center bg-black/40 px-6">
        <p className="text-center text-base font-medium text-zinc-400 sm:text-lg">
          Select a conversation to start messaging.
        </p>
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
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="border-b border-white/[0.06] px-4 py-2 text-left text-sm text-zinc-400 lg:hidden"
        >
          ← Back to inbox
        </button>
      ) : null}

      <header className="flex flex-col gap-4 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-emerald-400"
            aria-hidden
          >
            {conversation.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">
              {conversation.playerName}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {conversation.country} {conversation.countryFlag} · Class of{" "}
              {conversation.graduationYear}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/college/players/${conversation.playerId}`}
            className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-black transition hover:bg-emerald-400"
          >
            View Profile
          </Link>
          <Link
            href="/college/saved"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
          >
            Saved Players
          </Link>
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6">
        {conversation.messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/[0.06] p-4 sm:p-5">
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
            placeholder="Type your message..."
            rows={2}
            className="min-h-[52px] flex-1 resize-none rounded-2xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-emerald-500/40"
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
