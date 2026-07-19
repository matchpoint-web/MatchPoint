/**
 * College search types and client-side filter/sort helpers.
 * Data is loaded from Supabase via lib/college-search-service.ts.
 */

export type CollegeDivision =
  | "NCAA D1"
  | "NCAA D2"
  | "NCAA D3"
  | "NAIA"
  | "Junior College";

/** UI college shape for search cards and detail pages. */
export type College = {
  id: string;
  name: string;
  initials: string;
  division: CollegeDivision;
  conference: string | null;
  state: string;
  city: string;
  academicRanking: number | null;
  averageTeamUtr: number | null;
  rosterSize: number | null;
  internationalPlayers: number | null;
  costOfAttendance: number | null;
  coach: string;
  website: string;
  about: string;
  facilities: string;
  contact: string;
  logoUrl: string | null;
};

export type CollegeFilters = {
  division: string;
  utrRange: string;
};

export const defaultCollegeFilters: CollegeFilters = {
  division: "",
  utrRange: "",
};

export const collegeFilterOptions = {
  divisions: [
    { value: "", label: "All Divisions" },
    { value: "NCAA D1", label: "NCAA D1" },
    { value: "NCAA D2", label: "NCAA D2" },
    { value: "NCAA D3", label: "NCAA D3" },
    { value: "NAIA", label: "NAIA" },
    { value: "Junior College", label: "Junior College" },
  ],
  utrRanges: [
    { value: "", label: "Any Avg Team UTR" },
    { value: "under-10", label: "Under 10.0" },
    { value: "10-11", label: "10.0 – 11.0" },
    { value: "11-12", label: "11.0 – 12.0" },
    { value: "12-plus", label: "12.0+" },
  ],
};

export type CollegeSortOption =
  | "name-asc"
  | "utr-asc"
  | "utr-desc"
  | "division";

export const collegeSortOptions: {
  value: CollegeSortOption;
  label: string;
}[] = [
  { value: "name-asc", label: "Name A–Z" },
  { value: "utr-asc", label: "Avg Team UTR: Low to High" },
  { value: "utr-desc", label: "Avg Team UTR: High to Low" },
  { value: "division", label: "Division" },
];

export const COLLEGES_PER_PAGE = 6;

export function formatCostOfAttendance(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAcademicRanking(rank: number): string {
  return `#${rank}`;
}

export function matchesCollegeUtrRange(
  utr: number | null,
  range: string,
): boolean {
  if (!range) return true;
  if (utr == null) return false;
  switch (range) {
    case "under-10":
      return utr < 10;
    case "10-11":
      return utr >= 10 && utr < 11;
    case "11-12":
      return utr >= 11 && utr < 12;
    case "12-plus":
      return utr >= 12;
    default:
      return true;
  }
}

export function filterColleges(
  colleges: College[],
  query: string,
  filters: CollegeFilters,
): College[] {
  const q = query.trim().toLowerCase();

  return colleges.filter((college) => {
    if (
      q &&
      !college.name.toLowerCase().includes(q) &&
      !college.state.toLowerCase().includes(q) &&
      !college.city.toLowerCase().includes(q) &&
      !(college.conference?.toLowerCase().includes(q) ?? false)
    ) {
      return false;
    }
    if (filters.division && college.division !== filters.division) {
      return false;
    }
    if (!matchesCollegeUtrRange(college.averageTeamUtr, filters.utrRange)) {
      return false;
    }
    return true;
  });
}

export function sortColleges(
  colleges: College[],
  sort: CollegeSortOption,
): College[] {
  const sorted = [...colleges];
  switch (sort) {
    case "utr-asc":
      return sorted.sort(
        (a, b) => (a.averageTeamUtr ?? 0) - (b.averageTeamUtr ?? 0),
      );
    case "utr-desc":
      return sorted.sort(
        (a, b) => (b.averageTeamUtr ?? 0) - (a.averageTeamUtr ?? 0),
      );
    case "division":
      return sorted.sort(
        (a, b) =>
          a.division.localeCompare(b.division) || a.name.localeCompare(b.name),
      );
    case "name-asc":
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}
