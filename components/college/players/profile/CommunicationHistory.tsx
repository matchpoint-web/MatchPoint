import { GlassCard } from "@/components/player/GlassCard";
import { SectionTitle } from "@/components/player/SectionTitle";
import {
  formatEventTime,
  getCommunicationHistory,
  getEventIcon,
} from "@/lib/communication-history";

type CommunicationHistoryProps = {
  playerId: string;
  playerName: string;
};

export function CommunicationHistory({
  playerId,
  playerName,
}: CommunicationHistoryProps) {
  const events = getCommunicationHistory(playerId, playerName);

  return (
    <section>
      <SectionTitle
        title="Communication History"
        subtitle="Private — visible only to your college staff."
      />
      <GlassCard className="p-6 sm:p-8">
        <div className="space-y-0">
          {events.map((event, index) => (
            <div
              key={event.id}
              className="relative flex gap-5 pb-10 last:pb-0"
            >
              {index < events.length - 1 && (
                <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-gradient-to-b from-emerald-500/30 to-white/5" />
              )}

              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-sm">
                {getEventIcon(event.type)}
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/10 hover:bg-white/[0.05]">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                    {event.displayDate}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {formatEventTime(event.timestamp)}
                  </span>
                </div>
                <h3 className="mb-1 font-semibold tracking-tight text-white">
                  {event.title}
                </h3>
                <p className="text-sm leading-relaxed text-zinc-500">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  );
}
