import { GlassCard } from "@/components/player/GlassCard";
import { type ProfileStrength } from "@/lib/profile-strength";

type ProfileStrengthCardProps = {
  strength: ProfileStrength;
};

export function ProfileStrengthCard({ strength }: ProfileStrengthCardProps) {
  return (
    <GlassCard className="flex h-full flex-col p-6 sm:p-7">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Profile Strength
      </h2>

      <p className="mb-4 text-4xl font-bold tracking-tight text-emerald-400">
        {strength.score}
        <span className="text-2xl font-semibold text-zinc-500">%</span>
      </p>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
          style={{ width: `${strength.score}%` }}
        />
      </div>

      <ul className="mb-6 flex-1 space-y-2.5">
        {strength.items.map((item) => (
          <li
            key={item.label}
            className={`flex items-start gap-2.5 rounded-xl px-3 py-2 text-sm ${
              item.complete
                ? "bg-emerald-500/5 text-zinc-300"
                : "bg-amber-500/5 text-zinc-400"
            }`}
          >
            <span
              className={`mt-0.5 shrink-0 text-xs font-bold ${
                item.complete ? "text-emerald-400" : "text-amber-400"
              }`}
              aria-hidden
            >
              {item.complete ? "✓" : "⚠"}
            </span>
            <span className="leading-snug">{item.label}</span>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-relaxed text-zinc-500">
        {strength.message}
      </p>
    </GlassCard>
  );
}
