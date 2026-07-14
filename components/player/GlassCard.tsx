import { type ReactNode } from "react";

type GlassCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function GlassCard({
  children,
  className = "",
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 shadow-lg shadow-black/20 backdrop-blur-xl ${
        hover
          ? "transition-all duration-500 hover:-translate-y-0.5 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/5"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
