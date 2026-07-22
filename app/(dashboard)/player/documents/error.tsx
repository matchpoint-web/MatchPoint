"use client";

import { RouteError } from "@/components/routing/RouteError";

export default function PlayerDocumentsError({
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
      title="Documents unavailable"
      description="We couldn’t load your documents. Please try again."
    />
  );
}
