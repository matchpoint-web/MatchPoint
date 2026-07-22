import { PageSkeletonShell, Skeleton } from "@/components/ui/Skeleton";

/** Player + college dashboard metric grid + lists. */
export function DashboardPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading dashboard">
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-48 rounded-xl sm:h-9 sm:w-64" />
        <Skeleton className="h-4 w-72 max-w-full rounded-lg bg-white/[0.04]" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 sm:p-6"
          >
            <Skeleton className="mb-4 h-4 w-28 rounded-lg bg-white/[0.04]" />
            <Skeleton className="mb-2 h-8 w-20 rounded-xl" />
            <Skeleton className="h-3 w-40 rounded-lg bg-white/[0.04]" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 sm:p-6">
          <Skeleton className="mb-5 h-5 w-36 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-full rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-5 sm:p-6">
          <Skeleton className="mb-5 h-5 w-40 rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-14 w-full rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** Player profile hero + section cards. */
export function ProfilePageSkeleton() {
  return (
    <PageSkeletonShell
      label="Loading profile"
      className="px-6 py-12 sm:px-10 sm:py-16 lg:px-16"
    >
      <div className="mb-10 flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-lg bg-white/[0.04]" />
        <Skeleton className="h-10 w-28 rounded-2xl" />
      </div>

      <div className="mb-12 flex flex-col gap-8 sm:flex-row sm:items-start">
        <Skeleton className="mx-auto h-36 w-36 shrink-0 rounded-full sm:mx-0 sm:h-44 sm:w-44" />
        <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
          <Skeleton className="mx-auto h-4 w-20 rounded-lg bg-white/[0.04] sm:mx-0" />
          <Skeleton className="mx-auto h-10 w-56 max-w-full rounded-xl sm:mx-0" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-16 rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-5 w-32 rounded-lg" />
            <Skeleton className="h-32 w-full rounded-3xl bg-white/[0.04]" />
          </div>
        ))}
      </div>
    </PageSkeletonShell>
  );
}

/** Documents completion bar + card grid. */
export function DocumentsGridSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading documents">
      <Skeleton className="mb-6 h-28 w-full rounded-3xl bg-white/[0.04]" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-3xl bg-white/[0.04]" />
        ))}
      </div>
    </div>
  );
}

export function DocumentsPageSkeleton() {
  return (
    <PageSkeletonShell label="Loading documents">
      <Skeleton className="mb-6 h-4 w-80 max-w-full rounded-lg bg-white/[0.04]" />
      <DocumentsGridSkeleton />
    </PageSkeletonShell>
  );
}

/** Split inbox + chat pane. */
export function MessagesPageSkeleton({
  showIntro = false,
}: {
  showIntro?: boolean;
}) {
  return (
    <PageSkeletonShell
      label="Loading messages"
      className="px-4 py-4 sm:px-6 lg:px-8"
      contentClassName="mx-auto max-w-[1600px]"
    >
      {showIntro ? (
        <Skeleton className="mb-4 h-4 w-64 max-w-full rounded-lg bg-white/[0.04]" />
      ) : null}
      <div className="flex h-[min(70vh,720px)] overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-950/80">
        <div className="hidden w-[34%] flex-col border-r border-white/[0.06] p-3 lg:flex">
          <Skeleton className="mb-4 h-7 w-24 rounded-lg" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-16 w-full rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-lg bg-white/[0.04]" />
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-end gap-3">
            <Skeleton className="ml-auto h-12 w-2/3 max-w-md rounded-2xl" />
            <Skeleton className="h-12 w-1/2 max-w-sm rounded-2xl bg-white/[0.04]" />
            <Skeleton className="ml-auto h-16 w-3/4 max-w-lg rounded-2xl" />
          </div>
          <Skeleton className="mt-4 h-12 w-full rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    </PageSkeletonShell>
  );
}

/** College player profile detail. */
export function CollegePlayerProfileSkeleton() {
  return (
    <PageSkeletonShell
      label="Loading player profile"
      className="px-6 py-8 sm:px-8 lg:px-10"
      contentClassName="mx-auto max-w-4xl space-y-8 sm:space-y-10"
    >
      <Skeleton className="h-4 w-36 rounded-lg bg-white/[0.04]" />

      <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/70 to-zinc-950/80 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <Skeleton className="mx-auto h-36 w-36 shrink-0 rounded-full sm:mx-0 sm:h-44 sm:w-44" />
          <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
            <Skeleton className="mx-auto h-3 w-16 rounded-lg bg-white/[0.04] sm:mx-0" />
            <Skeleton className="mx-auto h-9 w-52 max-w-full rounded-xl sm:mx-0" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="h-16 rounded-2xl bg-white/[0.04]"
                />
              ))}
            </div>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Skeleton className="h-11 w-32 rounded-2xl" />
              <Skeleton className="h-11 w-36 rounded-2xl bg-white/[0.04]" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <Skeleton className="h-28 w-full rounded-3xl bg-white/[0.04]" />
      </div>

      <div className="space-y-3">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-3xl bg-white/[0.04]" />
          <Skeleton className="h-40 rounded-3xl bg-white/[0.04]" />
        </div>
      </div>
    </PageSkeletonShell>
  );
}
