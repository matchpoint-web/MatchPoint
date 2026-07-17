import { GlassCard } from "../GlassCard";

type ProfileCompletionProps = {
  completion: number;
  remainingSections?: number;
};

export function ProfileCompletion({
  completion,
  remainingSections = 2,
}: ProfileCompletionProps) {
  return (
    <GlassCard className="p-6 sm:p-8 lg:p-10">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Profile Completion
          </p>
          <p className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {completion}
            <span className="text-2xl font-semibold text-zinc-500 sm:text-3xl">
              %
            </span>
          </p>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-zinc-500">
            {remainingSections === 0
              ? "Your recruiting profile looks complete."
              : `Complete ${remainingSections} more section${remainingSections === 1 ? "" : "s"} to improve your visibility to college coaches.`}
          </p>
        </div>

        <div className="mb-8 h-2.5 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
            style={{ width: `${completion}%` }}
          />
        </div>

        <button
          type="button"
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-semibold text-black shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-emerald-500/40 sm:w-auto sm:min-w-[280px]"
        >
          Complete Profile
        </button>
      </div>
    </GlassCard>
  );
}
