"use client";

import {
  formatRelativeTime,
  type Conversation,
} from "@/lib/college-messages";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  const inbox = conversations.filter((conversation) => !conversation.isArchived);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl lg:w-[34%]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Inbox
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {inbox.length} conversation{inbox.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {inbox.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">
            No conversations yet.
          </p>
        ) : (
          inbox.map((conversation) => {
            const active = conversation.id === activeId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`mb-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                  active
                    ? "border border-emerald-500/20 bg-emerald-500/10"
                    : "border border-transparent hover:bg-white/[0.04]"
                }`}
              >
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold text-emerald-400/80"
                  aria-hidden
                >
                  {conversation.initials}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {conversation.playerName}
                    </p>
                    <span className="shrink-0 text-[10px] text-zinc-500">
                      {formatRelativeTime(conversation.lastMessageAt)}
                    </span>
                  </div>
                  <p className="mb-1 truncate text-xs text-zinc-500">
                    {conversation.country} {conversation.countryFlag}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="min-w-0 flex-1 truncate text-xs text-zinc-400">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 ? (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-black">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
