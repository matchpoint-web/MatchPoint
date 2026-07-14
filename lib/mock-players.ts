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

export type MockPlayer = {
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

export const mockPlayers: MockPlayer[] = [
  {
    id: "1",
    name: "Alex Tanaka",
    country: "Japan",
    countryFlag: "🇯🇵",
    graduationYear: "2027",
    utr: 11.2,
    gpa: 3.8,
    division: "NCAA D1",
    playingStyle: "Aggressive Baseliner",
    major: "Business Administration",
    academicTest: "TOEFL",
    height: 178,
    weight: 70,
    handedness: "Right",
    createdAt: "2026-03-10",
    initials: "AT",
  },
  {
    id: "2",
    name: "Yuta Kikuchi",
    country: "Japan",
    countryFlag: "🇯🇵",
    graduationYear: "2026",
    utr: 12.1,
    gpa: 3.6,
    division: "NCAA D1",
    playingStyle: "All-Court",
    major: "Economics",
    academicTest: "TOEFL",
    height: 182,
    weight: 75,
    handedness: "Right",
    createdAt: "2026-03-08",
    initials: "YK",
  },
  {
    id: "3",
    name: "Minho Kim",
    country: "South Korea",
    countryFlag: "🇰🇷",
    graduationYear: "2027",
    utr: 10.8,
    gpa: 3.9,
    division: "NCAA D1",
    playingStyle: "Counter-Puncher",
    major: "Computer Science",
    academicTest: "TOEFL",
    height: 175,
    weight: 68,
    handedness: "Right",
    createdAt: "2026-03-05",
    initials: "MK",
  },
  {
    id: "4",
    name: "Riku Sato",
    country: "Japan",
    countryFlag: "🇯🇵",
    graduationYear: "2028",
    utr: 10.2,
    gpa: 3.7,
    division: "NCAA D2",
    playingStyle: "Serve & Volley",
    major: "Sports Management",
    academicTest: "IELTS",
    height: 180,
    weight: 72,
    handedness: "Left",
    createdAt: "2026-02-28",
    initials: "RS",
  },
  {
    id: "5",
    name: "Lucas Martinez",
    country: "Spain",
    countryFlag: "🇪🇸",
    graduationYear: "2027",
    utr: 11.5,
    gpa: 3.5,
    division: "NCAA D1",
    playingStyle: "Aggressive Baseliner",
    major: "International Relations",
    academicTest: "Duolingo English Test",
    height: 185,
    weight: 78,
    handedness: "Right",
    createdAt: "2026-02-20",
    initials: "LM",
  },
  {
    id: "6",
    name: "Emma Wilson",
    country: "United States",
    countryFlag: "🇺🇸",
    graduationYear: "2026",
    utr: 9.8,
    gpa: 4.0,
    division: "NCAA D3",
    playingStyle: "All-Court",
    major: "Biology",
    academicTest: "TOEFL",
    height: 170,
    weight: 62,
    handedness: "Right",
    createdAt: "2026-02-15",
    initials: "EW",
  },
  {
    id: "7",
    name: "Pierre Dubois",
    country: "France",
    countryFlag: "🇫🇷",
    graduationYear: "2027",
    utr: 11.0,
    gpa: 3.4,
    division: "NCAA D1",
    playingStyle: "Counter-Puncher",
    major: "Engineering",
    academicTest: "IELTS",
    height: 188,
    weight: 80,
    handedness: "Left",
    createdAt: "2026-02-10",
    initials: "PD",
  },
  {
    id: "8",
    name: "Marco Rossi",
    country: "Italy",
    countryFlag: "🇮🇹",
    graduationYear: "2026",
    utr: 10.5,
    gpa: 3.6,
    division: "NAIA",
    playingStyle: "Aggressive Baseliner",
    major: "Finance",
    academicTest: "TOEFL",
    height: 183,
    weight: 76,
    handedness: "Right",
    createdAt: "2026-01-30",
    initials: "MR",
  },
  {
    id: "9",
    name: "Liam O'Brien",
    country: "Ireland",
    countryFlag: "🇮🇪",
    graduationYear: "2027",
    utr: 9.5,
    gpa: 3.8,
    division: "NCAA D2",
    playingStyle: "All-Court",
    major: "Psychology",
    academicTest: "IELTS",
    height: 177,
    weight: 71,
    handedness: "Right",
    createdAt: "2026-01-22",
    initials: "LO",
  },
  {
    id: "10",
    name: "Carlos Mendez",
    country: "Mexico",
    countryFlag: "🇲🇽",
    graduationYear: "2028",
    utr: 10.0,
    gpa: 3.3,
    division: "Junior College",
    playingStyle: "Serve & Volley",
    major: "Communications",
    academicTest: "Duolingo English Test",
    height: 176,
    weight: 69,
    handedness: "Right",
    createdAt: "2026-01-18",
    initials: "CM",
  },
  {
    id: "11",
    name: "Sofia Andersson",
    country: "Sweden",
    countryFlag: "🇸🇪",
    graduationYear: "2027",
    utr: 11.8,
    gpa: 3.9,
    division: "NCAA D1",
    playingStyle: "Aggressive Baseliner",
    major: "Data Science",
    academicTest: "TOEFL",
    height: 172,
    weight: 64,
    handedness: "Right",
    createdAt: "2026-01-12",
    initials: "SA",
  },
  {
    id: "12",
    name: "James Chen",
    country: "Canada",
    countryFlag: "🇨🇦",
    graduationYear: "2026",
    utr: 10.3,
    gpa: 3.7,
    division: "NCAA D3",
    playingStyle: "Counter-Puncher",
    major: "Mathematics",
    academicTest: "TOEFL",
    height: 179,
    weight: 73,
    handedness: "Left",
    createdAt: "2026-01-05",
    initials: "JC",
  },
];

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
    ...new Set(mockPlayers.map((p) => p.major)),
    "Other",
  ].sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b))),
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
const listedMajors = filterOptions.majors.filter((m) => m !== "Other");
const listedAcademicTests = filterOptions.academicTests.filter((t) => t !== "Other");

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

export function matchesHeightRange(height: number, range: string): boolean {
  if (!range) return true;
  switch (range) {
    case "under-150":
      return height < 150;
    case "150-160":
      return height >= 150 && height < 160;
    case "160-170":
      return height >= 160 && height < 170;
    case "170-180":
      return height >= 170 && height < 180;
    case "180-190":
      return height >= 180 && height < 190;
    case "190-200":
      return height >= 190 && height < 200;
    case "200+":
      return height >= 200;
    default:
      return true;
  }
}

export function matchesMajorFilter(major: string, filter: string): boolean {
  if (!filter) return true;
  if (filter === "Other") return !listedMajors.includes(major);
  return major === filter;
}

export function matchesAcademicTestFilter(test: string, filter: string): boolean {
  if (!filter) return true;
  if (filter === "Other") {
    return !listedAcademicTests.some((listed) => listed === test);
  }
  return test === filter;
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
