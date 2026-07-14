export type PlayerProfile = {
  name: string;
  country: string;
  countryFlag: string;
  age: number;
  graduationYear: string;
  utr: string;
  gpa: string;
  height: string;
  weight: string;
  handedness: string;
  about: string;
  completion: number;
};

export type HighlightVideo = {
  id: string;
  title: string;
  duration: string;
};

export type Achievement = {
  id: string;
  title: string;
  year: string;
  description: string;
};

export type FavoriteCollege = {
  id: string;
  name: string;
  location: string;
  division: string;
  initials: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  status: "uploaded" | "missing";
};

export const playerProfile: PlayerProfile = {
  name: "Alex Tanaka",
  country: "Japan",
  countryFlag: "🇯🇵",
  age: 18,
  graduationYear: "2027",
  utr: "11.2",
  gpa: "3.8",
  height: "178 cm",
  weight: "70 kg",
  handedness: "Right-handed",
  about:
    "I am an internationally competitive tennis player seeking NCAA opportunities. My goal is to compete at the highest collegiate level while pursuing a degree in Business.",
  completion: 72,
};

export const academicInfo = [
  { label: "High School", value: "Tokyo International School" },
  { label: "Expected Graduation", value: "June 2027" },
  { label: "GPA", value: "3.8 / 4.0" },
  { label: "SAT", value: "1420" },
  { label: "TOEFL", value: "108" },
  { label: "Intended Major", value: "Business Administration" },
];

export const tennisInfo = [
  { label: "UTR", value: "11.2" },
  { label: "USTA Ranking", value: "#42 (Boys 18s)" },
  { label: "ITF Ranking", value: "#890" },
  { label: "National Ranking", value: "#8 (Japan)" },
  { label: "Preferred Division", value: "NCAA Division I" },
  { label: "Playing Style", value: "Aggressive Baseliner" },
];

export const highlightVideos: HighlightVideo[] = [
  { id: "1", title: "ITF Junior Final Highlights", duration: "3:24" },
  { id: "2", title: "National Championship Match", duration: "5:12" },
  { id: "3", title: "Training & Match Play Reel", duration: "4:08" },
];

export const achievements: Achievement[] = [
  {
    id: "1",
    title: "National Champion",
    year: "2025",
    description: "All-Japan Junior Championships — Boys 18 & Under",
  },
  {
    id: "2",
    title: "ITF Junior",
    year: "2024",
    description: "ITF J300 Osaka — Semifinalist",
  },
  {
    id: "3",
    title: "USTA Level 1",
    year: "2024",
    description: "Easter Bowl — Quarterfinalist",
  },
  {
    id: "4",
    title: "Regional Champion",
    year: "2023",
    description: "Kanto Regional Junior Championships — Champion",
  },
];

export const favoriteColleges: FavoriteCollege[] = [
  {
    id: "stanford",
    name: "Stanford",
    location: "Stanford, CA",
    division: "NCAA D-I",
    initials: "S",
  },
  {
    id: "ucla",
    name: "UCLA",
    location: "Los Angeles, CA",
    division: "NCAA D-I",
    initials: "U",
  },
  {
    id: "usc",
    name: "USC",
    location: "Los Angeles, CA",
    division: "NCAA D-I",
    initials: "US",
  },
  {
    id: "texas",
    name: "Texas",
    location: "Austin, TX",
    division: "NCAA D-I",
    initials: "T",
  },
  {
    id: "florida",
    name: "Florida",
    location: "Gainesville, FL",
    division: "NCAA D-I",
    initials: "F",
  },
];

export const documents: DocumentItem[] = [
  { id: "transcript", name: "Transcript", status: "uploaded" },
  { id: "english-test", name: "English Test", status: "missing" },
];
