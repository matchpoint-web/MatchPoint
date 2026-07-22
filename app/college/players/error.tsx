"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function CollegePlayersError({
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
      title="Player search unavailable"
      description="We couldn’t load player search. Please try again."
    />
  );
}
