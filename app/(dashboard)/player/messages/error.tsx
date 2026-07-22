"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function PlayerMessagesError({
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
      title="Messages unavailable"
      description="We couldn’t load your messages. Please try again."
    />
  );
}
