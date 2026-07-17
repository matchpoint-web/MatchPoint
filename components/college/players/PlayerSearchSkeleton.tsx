export function PlayerSearchSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading players">
      <div className="mb-6 h-14 animate-pulse rounded-3xl bg-white/[0.04]" />
      <div className="mb-8 h-24 animate-pulse rounded-3xl bg-white/[0.04]" />
      <div className="mb-6 flex justify-between">
        <div className="h-5 w-28 animate-pulse rounded bg-white/[0.04]" />
        <div className="h-9 w-36 animate-pulse rounded-2xl bg-white/[0.04]" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col rounded-3xl border border-white/8 bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-5 sm:p-6"
          >
            <div className="mb-4 flex items-start gap-4">
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-white/[0.06]" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <div className="h-5 w-2/3 animate-pulse rounded bg-white/[0.06]" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-white/[0.04]" />
              </div>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((__, statIndex) => (
                <div
                  key={statIndex}
                  className="h-14 animate-pulse rounded-xl bg-white/[0.04]"
                />
              ))}
            </div>
            <div className="mt-auto flex gap-2">
              <div className="h-10 flex-1 animate-pulse rounded-2xl bg-white/[0.06]" />
              <div className="h-10 w-28 animate-pulse rounded-2xl bg-white/[0.04]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
