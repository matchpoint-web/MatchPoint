"use client";

type RouteErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
};

/**
 * Shared route error UI for error.tsx boundaries.
 * Shows a friendly message and reset() — never stack traces.
 */
export function RouteError({
  error,
  reset,
  title = "Something went wrong",
  description = "We couldn’t load this page. Please try again.",
}: RouteErrorProps) {
  // Keep digest available for support without exposing internals in the UI.
  void error.digest;

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-lg">
        <div
          className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 px-6 py-10 text-center sm:px-8"
          role="alert"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-emerald-400/80">
            MatchPoint
          </p>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            {description}
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
