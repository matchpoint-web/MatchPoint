"use client";

import {
  conversationFilters,
  filterConversations,
  formatRelativeTime,
  type Conversation,
  type ConversationFilter,
} from "@/lib/college-messages";

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  search: string;
  filter: ConversationFilter;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: ConversationFilter) => void;
  onSelect: (id: string) => void;
};

export function ConversationList({
  conversations,
  activeId,
  search,
  filter,
  onSearchChange,
  onFilterChange,
  onSelect,
}: ConversationListProps) {
  const filtered = filterConversations(conversations, filter, search);

  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl lg:w-[30%]">
      <div className="border-b border-white/[0.06] p-4 sm:p-5">
        <h1 className="mb-4 text-xl font-semibold tracking-tight text-white">
          Messages
        </h1>

        <div className="relative mb-4">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-emerald-500/40"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {conversationFilters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onFilterChange(item.value)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === item.value
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-zinc-500">
            No conversations found.
          </p>
        ) : (
          filtered.map((conversation) => {
            const active = conversation.id === activeId;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelect(conversation.id)}
                className={`mb-1 flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
                  active
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "border border-transparent hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold text-emerald-400/80">
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
                    {conversation.unreadCount > 0 && (
                      <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-black">
                        {conversation.unreadCount}
                      </span>
                    )}
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
