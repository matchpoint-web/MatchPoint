"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function PlayerProfileError({
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
      title="Profile unavailable"
      description="We couldn’t load your profile. Please try again."
    />
  );
}
