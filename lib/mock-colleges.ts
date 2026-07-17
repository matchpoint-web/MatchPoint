export type CollegeDivision =
  | "NCAA D1"
  | "NCAA D2"
  | "NCAA D3"
  | "NAIA"
  | "Junior College";

export type MockCollege = {
  id: string;
  name: string;
  initials: string;
  division: CollegeDivision;
  conference: string | null;
  state: string;
  city: string;
  academicRanking: number | null;
  averageTeamUtr: number | null;
  rosterSize: number;
  internationalPlayers: number;
  costOfAttendance: number | null;
  coach: string;
  website: string;
  about: string;
  facilities: string;
  contact: string;
};

export const mockColleges: MockCollege[] = [
  {
    id: "stanford",
    name: "Stanford University",
    initials: "SU",
    division: "NCAA D1",
    conference: "ACC",
    state: "CA",
    city: "Stanford",
    academicRanking: 3,
    averageTeamUtr: 13.1,
    rosterSize: 10,
    internationalPlayers: 6,
    costOfAttendance: 82000,
    coach: "Paul Goldstein",
    website: "https://gostanford.com/sports/mens-tennis",
    about:
      "Stanford Men's Tennis is one of the most successful programs in NCAA history, with a strong balance of academics and athletics.",
    facilities:
      "Taube Family Tennis Stadium with outdoor hard courts, indoor training access, strength & conditioning center, and sports medicine support.",
    contact: "tennis@stanford.edu",
  },
  {
    id: "ucla",
    name: "University of California, Los Angeles",
    initials: "UCLA",
    division: "NCAA D1",
    conference: "Big Ten",
    state: "CA",
    city: "Los Angeles",
    academicRanking: 15,
    averageTeamUtr: 12.9,
    rosterSize: 11,
    internationalPlayers: 7,
    costOfAttendance: 75000,
    coach: "Billy Martin",
    website: "https://uclabruins.com/sports/mens-tennis",
    about:
      "UCLA Bruins tennis offers elite competition, world-class facilities, and a tradition of developing collegiate champions.",
    facilities:
      "Los Angeles Tennis Center stadium courts, practice courts, video analysis, and full athletic performance resources.",
    contact: "mttennis@athletics.ucla.edu",
  },
  {
    id: "usc",
    name: "University of Southern California",
    initials: "USC",
    division: "NCAA D1",
    conference: "Big Ten",
    state: "CA",
    city: "Los Angeles",
    academicRanking: 28,
    averageTeamUtr: 12.7,
    rosterSize: 10,
    internationalPlayers: 5,
    costOfAttendance: 85000,
    coach: "Peter Smith",
    website: "https://usctrojans.com/sports/mens-tennis",
    about:
      "USC Trojans tennis combines high-level training with a competitive schedule and strong academic support in Los Angeles.",
    facilities:
      "Marks Tennis Stadium, outdoor hard courts, on-campus athletic training rooms, and recovery amenities.",
    contact: "tennis@usc.edu",
  },
  {
    id: "texas",
    name: "University of Texas at Austin",
    initials: "UT",
    division: "NCAA D1",
    conference: "SEC",
    state: "TX",
    city: "Austin",
    academicRanking: 38,
    averageTeamUtr: 13.0,
    rosterSize: 12,
    internationalPlayers: 8,
    costOfAttendance: 58000,
    coach: "Bruce Foxworth",
    website: "https://texassports.com/sports/mens-tennis",
    about:
      "Texas Men's Tennis competes at the highest level with outstanding facilities and a culture focused on championship performance.",
    facilities:
      "Texas Tennis Center with multiple outdoor courts, indoor backup options, and integrated sports science support.",
    contact: "mens.tennis@athletics.utexas.edu",
  },
  {
    id: "florida",
    name: "University of Florida",
    initials: "UF",
    division: "NCAA D1",
    conference: "SEC",
    state: "FL",
    city: "Gainesville",
    academicRanking: 28,
    averageTeamUtr: 12.8,
    rosterSize: 11,
    internationalPlayers: 7,
    costOfAttendance: 45000,
    coach: "Bryan Shelton",
    website: "https://floridagators.com/sports/mens-tennis",
    about:
      "Florida Gators tennis is known for developing complete student-athletes in a highly competitive SEC environment.",
    facilities:
      "Alfred A. Ring Tennis Complex with stadium seating, outdoor hard courts, and year-round Florida training weather.",
    contact: "tennis@gators.ufl.edu",
  },
  {
    id: "michigan",
    name: "University of Michigan",
    initials: "UM",
    division: "NCAA D1",
    conference: "Big Ten",
    state: "MI",
    city: "Ann Arbor",
    academicRanking: 21,
    averageTeamUtr: 12.2,
    rosterSize: 10,
    internationalPlayers: 4,
    costOfAttendance: 72000,
    coach: "Adam Steinberg",
    website: "https://mgoblue.com/sports/mens-tennis",
    about:
      "Michigan Men's Tennis offers Big Ten competition, excellent academics, and a collaborative coaching environment.",
    facilities:
      "Varsity Tennis Center with indoor and outdoor courts, weight room access, and academic support services.",
    contact: "mttennis@umich.edu",
  },
  {
    id: "emory",
    name: "Emory University",
    initials: "EU",
    division: "NCAA D3",
    conference: "UAA",
    state: "GA",
    city: "Atlanta",
    academicRanking: 24,
    averageTeamUtr: 11.0,
    rosterSize: 14,
    internationalPlayers: 3,
    costOfAttendance: 78000,
    coach: "Jordan Orloff",
    website: "https://emoryathletics.com/sports/mten",
    about:
      "Emory is a top NCAA Division III tennis program emphasizing academics, development, and consistent national contention.",
    facilities:
      "Woodruff Physical Education Center courts, outdoor hard courts, and campus athletic training support.",
    contact: "tennis@emory.edu",
  },
  {
    id: "claremont",
    name: "Claremont-Mudd-Scripps",
    initials: "CMS",
    division: "NCAA D3",
    conference: "SCIAC",
    state: "CA",
    city: "Claremont",
    academicRanking: 5,
    averageTeamUtr: 11.2,
    rosterSize: 16,
    internationalPlayers: 2,
    costOfAttendance: null,
    coach: "Paul Settles",
    website: "https://cmsathletics.org/sports/mten",
    about:
      "CMS Tennis is a premier D3 destination for academically driven players seeking high-level doubles and singles competition.",
    facilities:
      "Biszantz Family Tennis Center with outdoor courts, team lounge space, and shared Claremont Colleges athletic resources.",
    contact: "tennis@cms.claremont.edu",
  },
  {
    id: "pepperdine",
    name: "Pepperdine University",
    initials: "PU",
    division: "NCAA D1",
    conference: "WCC",
    state: "CA",
    city: "Malibu",
    academicRanking: 55,
    averageTeamUtr: 12.0,
    rosterSize: 9,
    internationalPlayers: 6,
    costOfAttendance: 88000,
    coach: "Adam Reeb",
    website: "https://pepperdinewaves.com/sports/mens-tennis",
    about:
      "Pepperdine Waves tennis offers coastal training, West Coast Conference competition, and strong international recruiting.",
    facilities:
      "Ralphs-Straus Tennis Center overlooking the Pacific, outdoor hard courts, and on-campus performance facilities.",
    contact: "mens.tennis@pepperdine.edu",
  },
  {
    id: "baylor",
    name: "Baylor University",
    initials: "BU",
    division: "NCAA D1",
    conference: "Big 12",
    state: "TX",
    city: "Waco",
    academicRanking: 93,
    averageTeamUtr: 12.4,
    rosterSize: 10,
    internationalPlayers: 7,
    costOfAttendance: 68000,
    coach: "Erik Meade",
    website: "https://baylorbears.com/sports/mens-tennis",
    about:
      "Baylor Men's Tennis features modern facilities and a competitive Big 12 schedule with a focus on player development.",
    facilities:
      "Hurd Tennis Center with indoor and outdoor courts, locker rooms, and integrated athletic performance spaces.",
    contact: "tennis@baylor.edu",
  },
  {
    id: "north-florida",
    name: "University of North Florida",
    initials: "UNF",
    division: "NCAA D1",
    conference: "ASUN",
    state: "FL",
    city: "Jacksonville",
    academicRanking: null,
    averageTeamUtr: 11.1,
    rosterSize: 9,
    internationalPlayers: 5,
    costOfAttendance: 36000,
    coach: "Fernando Cabrera",
    website: "https://unfospreys.com/sports/mens-tennis",
    about:
      "UNF Ospreys tennis provides Division I opportunity with a supportive coaching staff and year-round outdoor training.",
    facilities:
      "UNF Tennis Complex with outdoor hard courts, shaded seating, and nearby campus training amenities.",
    contact: "tennis@unf.edu",
  },
  {
    id: "indiana-tech",
    name: "Indiana Tech",
    initials: "IT",
    division: "NAIA",
    conference: "WHAC",
    state: "IN",
    city: "Fort Wayne",
    academicRanking: null,
    averageTeamUtr: 9.8,
    rosterSize: 12,
    internationalPlayers: 8,
    costOfAttendance: 42000,
    coach: "Michael Koehler",
    website: "https://indianatechwarriors.com/sports/mten",
    about:
      "Indiana Tech offers competitive NAIA tennis with a player-focused development pathway.",
    facilities:
      "Warrior Tennis Courts with outdoor hard courts and shared athletic department training resources.",
    contact: "tennis@indianatech.edu",
  },
  {
    id: "tyler-jc",
    name: "Tyler Junior College",
    initials: "TJC",
    division: "Junior College",
    conference: null,
    state: "TX",
    city: "Tyler",
    academicRanking: null,
    averageTeamUtr: 9.4,
    rosterSize: 10,
    internationalPlayers: 9,
    costOfAttendance: 18000,
    coach: "Todd Pettyjohn",
    website: "https://apacheathletics.com/sports/mten",
    about:
      "Tyler Junior College is a top JUCO tennis program helping international and domestic players prepare for four-year transfers.",
    facilities:
      "TJC Tennis Courts with outdoor hard courts and on-campus athletic training support.",
    contact: "tennis@tjc.edu",
  },
  {
    id: "georgia",
    name: "University of Georgia",
    initials: "UGA",
    division: "NCAA D1",
    conference: "SEC",
    state: "GA",
    city: "Athens",
    academicRanking: 47,
    averageTeamUtr: 13.2,
    rosterSize: 11,
    internationalPlayers: 6,
    costOfAttendance: 48000,
    coach: "Manuel Diaz",
    website: "https://georgiadogs.com/sports/mens-tennis",
    about:
      "Georgia Bulldogs tennis is a national powerhouse with elite facilities and a championship-driven culture in the SEC.",
    facilities:
      "Dan Magill Tennis Complex with stadium courts, practice courts, and comprehensive athletic support services.",
    contact: "tennis@sports.uga.edu",
  },
];

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

export function getCollegeById(id: string): MockCollege | undefined {
  return mockColleges.find((college) => college.id === id);
}
