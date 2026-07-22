"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function CollegePlayerProfileError({
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
      title="Player profile unavailable"
      description="We couldn’t load this player profile. Please try again."
    />
  );
}
