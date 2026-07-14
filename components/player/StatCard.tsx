import { GlassCard } from "./GlassCard";

type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <GlassCard hover className="p-5 sm:p-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="text-lg font-semibold tracking-tight text-white sm:text-xl">
        {value}
      </p>
    </GlassCard>
  );
}
