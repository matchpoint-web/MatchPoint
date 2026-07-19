/**
 * Shared player domain types and college player-search filter helpers.
 * Player list/detail data comes from lib/player-service.ts (Supabase).
 */

export type AcademicTest =
  | "TOEFL"
  | "IELTS"
  | "Duolingo English Test"
  | "SAT"
  | "ACT"
  | "Other";

export type PreferredDivision =
  | "NCAA D1"
  | "NCAA D2"
  | "NCAA D3"
  | "NAIA"
  | "Junior College";

/** College recruiting list / card shape (mapped from Supabase players). */
export type Player = {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  graduationYear: string;
  utr: number;
  gpa: number;
  division: PreferredDivision;
  playingStyle: string;
  major: string;
  academicTest: AcademicTest;
  height: number;
  weight: number;
  handedness: "Right" | "Left";
  createdAt: string;
  initials: string;
};

export const filterOptions = {
  countries: [
    "United States",
    "Canada",
    "Mexico",
    "Brazil",
    "Argentina",
    "Chile",
    "Colombia",
    "Peru",
    "United Kingdom",
    "France",
    "Germany",
    "Spain",
    "Italy",
    "Netherlands",
    "Belgium",
    "Sweden",
    "Norway",
    "Denmark",
    "Switzerland",
    "Czech Republic",
    "Serbia",
    "Croatia",
    "Poland",
    "Austria",
    "Japan",
    "South Korea",
    "China",
    "Chinese Taipei",
    "Hong Kong",
    "Thailand",
    "Malaysia",
    "Singapore",
    "Indonesia",
    "Philippines",
    "India",
    "Vietnam",
    "Australia",
    "New Zealand",
    "South Africa",
    "Morocco",
    "Egypt",
    "Other",
  ],
  graduationYears: ["2026", "2027", "2028", "2029", "2030", "2031", "Other"],
  utrRanges: [
    { value: "", label: "Any UTR" },
    { value: "6-7", label: "6.0–7.0" },
    { value: "7-8", label: "7.0–8.0" },
    { value: "8-9", label: "8.0–9.0" },
    { value: "9-10", label: "9.0–10.0" },
    { value: "10-11", label: "10.0–11.0" },
    { value: "11-12", label: "11.0–12.0" },
    { value: "12-13", label: "12.0–13.0" },
    { value: "13-14", label: "13.0–14.0" },
    { value: "14+", label: "14.0+" },
  ],
  gpaRanges: [
    { value: "", label: "Any GPA" },
    { value: "below-2", label: "Below 2.0" },
    { value: "2-2.5", label: "2.0–2.5" },
    { value: "2.5-3", label: "2.5–3.0" },
    { value: "3-3.5", label: "3.0–3.5" },
    { value: "3.5-4", label: "3.5–4.0" },
  ],
  divisions: [
    "NCAA D1",
    "NCAA D2",
    "NCAA D3",
    "NAIA",
    "Junior College",
  ] as PreferredDivision[],
  handedness: ["Right", "Left"] as const,
  majors: [
    "Biology",
    "Business Administration",
    "Communications",
    "Computer Science",
    "Data Science",
    "Economics",
    "Engineering",
    "Finance",
    "International Relations",
    "Mathematics",
    "Psychology",
    "Sports Management",
    "Other",
  ],
  academicTests: [
    "TOEFL",
    "IELTS",
    "Duolingo English Test",
    "SAT",
    "ACT",
    "Other",
  ] as AcademicTest[],
  heightRanges: [
    { value: "", label: "Any Height" },
    { value: "under-150", label: "Under 150 cm" },
    { value: "150-160", label: "150–160 cm" },
    { value: "160-170", label: "160–170 cm" },
    { value: "170-180", label: "170–180 cm" },
    { value: "180-190", label: "180–190 cm" },
    { value: "190-200", label: "190–200 cm" },
    { value: "200+", label: "200 cm+" },
  ],
};

const listedCountries = filterOptions.countries.filter((c) => c !== "Other");
const listedGradYears = filterOptions.graduationYears.filter((y) => y !== "Other");

export function matchesCountryFilter(country: string, filter: string): boolean {
  if (!filter) return true;
  if (filter === "Other") return !listedCountries.includes(country);
  return country === filter;
}

export function matchesGraduationYearFilter(year: string, filter: string): boolean {
  if (!filter) return true;
  if (filter === "Other") return !listedGradYears.includes(year);
  return year === filter;
}

export function matchesUtrRange(utr: number, range: string): boolean {
  if (!range) return true;
  const ranges: Record<string, [number, number | null]> = {
    "6-7": [6, 7],
    "7-8": [7, 8],
    "8-9": [8, 9],
    "9-10": [9, 10],
    "10-11": [10, 11],
    "11-12": [11, 12],
    "12-13": [12, 13],
    "13-14": [13, 14],
    "14+": [14, null],
  };
  const bounds = ranges[range];
  if (!bounds) return true;
  const [min, max] = bounds;
  if (max === null) return utr >= min;
  return utr >= min && utr < max;
}

export function matchesGpaRange(gpa: number, range: string): boolean {
  if (!range) return true;
  switch (range) {
    case "below-2":
      return gpa < 2;
    case "2-2.5":
      return gpa >= 2 && gpa < 2.5;
    case "2.5-3":
      return gpa >= 2.5 && gpa < 3;
    case "3-3.5":
      return gpa >= 3 && gpa < 3.5;
    case "3.5-4":
      return gpa >= 3.5 && gpa <= 4;
    default:
      return true;
  }
}

export type SortOption = "highest-utr" | "highest-gpa" | "newest";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "highest-utr", label: "Highest UTR" },
  { value: "highest-gpa", label: "Highest GPA" },
  { value: "newest", label: "Newest" },
];

export const PLAYERS_PER_PAGE = 6;

export type PlayerFilters = {
  country: string;
  graduationYear: string;
  utrRange: string;
  gpaRange: string;
  division: string;
  handedness: string;
  major: string;
  academicTest: string;
  heightRange: string;
};

export const defaultFilters: PlayerFilters = {
  country: "",
  graduationYear: "",
  utrRange: "",
  gpaRange: "",
  division: "",
  handedness: "",
  major: "",
  academicTest: "",
  heightRange: "",
};
