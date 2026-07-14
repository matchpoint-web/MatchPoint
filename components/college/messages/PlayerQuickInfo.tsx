"use client";

import Link from "next/link";
import { type Conversation } from "@/lib/college-messages";

type PlayerQuickInfoProps = {
  conversation: Conversation;
  onInvite: () => void;
};

export function PlayerQuickInfo({
  conversation,
  onInvite,
}: PlayerQuickInfoProps) {
  const stats = [
    { label: "UTR", value: conversation.utr.toFixed(1) },
    { label: "GPA", value: conversation.gpa.toFixed(1) },
    { label: "Graduation Year", value: conversation.graduationYear },
    { label: "Preferred Division", value: conversation.division },
    { label: "English Test", value: conversation.englishTest },
  ];

  return (
    <aside className="hidden h-full min-h-0 w-[280px] shrink-0 flex-col border-l border-white/[0.06] bg-zinc-950/60 backdrop-blur-xl xl:flex">
      <div className="border-b border-white/[0.06] p-5">
        <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
          Player Quick Info
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-gradient-to-br from-zinc-800 to-zinc-900 text-sm font-bold text-emerald-400">
            {conversation.initials}
          </div>
          <div>
            <p className="font-semibold text-white">{conversation.playerName}</p>
            <p className="text-xs text-zinc-500">
              {conversation.country} {conversation.countryFlag}
            </p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3.5 py-3"
          >
            <p className="mb-0.5 text-[10px] uppercase tracking-wider text-zinc-500">
              {stat.label}
            </p>
            <p className="text-sm font-semibold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 border-t border-white/[0.06] p-4">
        <Link
          href={`/college/players/${conversation.playerId}`}
          className="flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black transition-all hover:bg-emerald-400"
        >
          Open Full Profile
        </Link>
        <button
          type="button"
          onClick={onInvite}
          className="w-full rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/20"
        >
          Invite To Recruiting List
        </button>
      </div>
    </aside>
  );
}
