import { CollegeSearchClient } from "@/components/player/colleges/CollegeSearchClient";

export default function CollegeSearchPage() {
  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="mb-6 text-sm text-zinc-500 sm:text-base">
          Explore college tennis programs and find your next opportunity.
        </p>
        <CollegeSearchClient />
      </div>
    </div>
  );
}
