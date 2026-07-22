"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function CollegeDashboardError({
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
      description="We couldn’t load your college dashboard. Please try again."
    />
  );
}
