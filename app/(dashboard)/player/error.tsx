"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function PlayerDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteError
      error={error}
      reset={reset}
      title="Dashboard unavailable"
      description="We couldn’t load your player dashboard. Please try again."
    />
  );
}
