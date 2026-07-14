import Link from "next/link";
import { mockConversations } from "@/lib/college-messages";

const savedPlayers = mockConversations.filter((c) => c.isSaved && !c.isArchived);

export default function SavedPlayersPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="mb-6 text-sm text-zinc-500">
          Players your staff has bookmarked for recruiting follow-up.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {savedPlayers.map((player) => (
            <Link
              key={player.id}
              href={`/college/players/${player.playerId}`}
              className="group rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-5 transition-all hover:-translate-y-0.5 hover:border-emerald-500/20"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-zinc-900 text-sm font-bold text-emerald-400">
                  {player.initials}
                </div>
                <div>
                  <p className="font-semibold text-white group-hover:text-emerald-300">
                    {player.playerName}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {player.country} {player.countryFlag}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-white/[0.03] px-2 py-2">
                  <p className="text-[10px] uppercase text-zinc-500">UTR</p>
                  <p className="text-sm font-semibold text-white">
                    {player.utr.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-2 py-2">
                  <p className="text-[10px] uppercase text-zinc-500">GPA</p>
                  <p className="text-sm font-semibold text-white">
                    {player.gpa.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.03] px-2 py-2">
                  <p className="text-[10px] uppercase text-zinc-500">Class</p>
                  <p className="text-sm font-semibold text-white">
                    {player.graduationYear}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
