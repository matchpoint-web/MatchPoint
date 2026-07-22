import type { ReactNode } from "react";

type SkeletonProps = {
  className?: string;
};

/** Lightweight pulse block for dark-theme route skeletons. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`}
      aria-hidden
    />
  );
}

type PageSkeletonShellProps = {
  children: ReactNode;
  /** Accessible label while the route is loading. */
  label: string;
  className?: string;
  contentClassName?: string;
};

/** Matches dashboard page padding used across player/college routes. */
export function PageSkeletonShell({
  children,
  label,
  className = "px-6 py-8 sm:px-8 lg:px-10",
  contentClassName = "mx-auto max-w-6xl",
}: PageSkeletonShellProps) {
  return (
    <div className={className} aria-busy="true" aria-label={label}>
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
