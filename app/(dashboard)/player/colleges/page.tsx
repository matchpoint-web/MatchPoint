import { CollegeSearchClient } from "@/components/player/colleges/CollegeSearchClient";
import { getColleges } from "@/lib/college-search-service";
import { getSavedCollegeIds } from "@/lib/saved-college-service";

export default async function CollegeSearchPage() {
  let colleges: Awaited<ReturnType<typeof getColleges>> = [];
  let savedIds: string[] = [];

  try {
    colleges = await getColleges();
  } catch {
    colleges = [];
  }

  try {
    savedIds = await getSavedCollegeIds();
  } catch {
    savedIds = [];
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Explore college tennis programs and find your next opportunity.
        </p>
        <CollegeSearchClient
          initialColleges={colleges}
          initialSavedIds={savedIds}
        />
      </div>
    </div>
  );
}
