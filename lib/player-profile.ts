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
  profileImageUrl?: string | null;
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
