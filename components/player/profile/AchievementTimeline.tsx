import { type Achievement } from "@/lib/player-profile";
import { GlassCard } from "../GlassCard";

type AchievementTimelineProps = {
  achievements: Achievement[];
};

export function AchievementTimeline({ achievements }: AchievementTimelineProps) {
  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="relative space-y-0">
        {achievements.map((item, index) => (
          <div key={item.id} className="relative flex gap-5 pb-10 last:pb-0">
            {index < achievements.length - 1 && (
              <div className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-gradient-to-b from-emerald-500/40 to-white/5" />
            )}
            <div className="relative z-10 mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20">
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-semibold tracking-tight text-white">
                  {item.title}
                </h3>
                <span className="text-sm font-medium text-emerald-400">
                  {item.year}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
