import { PlayerSearchSkeleton } from "@/components/college/players/PlayerSearchSkeleton";
import { PageSkeletonShell } from "@/components/ui/Skeleton";

export default function CollegePlayersLoading() {
  return (
    <PageSkeletonShell
      label="Loading player search"
      contentClassName="mx-auto max-w-7xl"
    >
      <PlayerSearchSkeleton />
    </PageSkeletonShell>
  );
}
