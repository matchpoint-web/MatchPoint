"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function CollegeMessagesError({
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
      description="We couldn’t load college messages. Please try again."
    />
  );
}
