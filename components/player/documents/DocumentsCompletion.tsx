import { GlassCard } from "@/components/player/GlassCard";

type DocumentsCompletionProps = {
  percent: number;
  uploaded: number;
  total: number;
  requiredUploaded: number;
  requiredTotal: number;
};

export function DocumentsCompletion({
  percent,
  uploaded,
  total,
  requiredUploaded,
  requiredTotal,
}: DocumentsCompletionProps) {
  return (
    <GlassCard className="p-6 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Document Completion
          </p>
          <p className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {percent}
            <span className="text-xl font-semibold text-zinc-500 sm:text-2xl">
              %
            </span>
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            {requiredUploaded} of {requiredTotal} required · {uploaded} of{" "}
            {total} total uploaded
          </p>
        </div>
      </div>

      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
          style={{ width: `${percent}%` }}
        />
      </div>
    </GlassCard>
  );
}
