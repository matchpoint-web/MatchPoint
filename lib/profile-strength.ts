export type ProfileStrengthItem = {
  label: string;
  complete: boolean;
};

export type ProfileStrength = {
  score: number;
  items: ProfileStrengthItem[];
  message: string;
};

export const defaultProfileStrength: ProfileStrength = {
  score: 72,
  items: [
    { label: "Profile Photo", complete: true },
    { label: "Highlight Videos", complete: true },
    { label: "Academic Information", complete: true },
    { label: "UTR Verified", complete: true },
    { label: "SAT Score Missing", complete: false },
    { label: "Updated Transcript Needed", complete: false },
  ],
  message:
    "Complete 2 more sections to improve your visibility to college coaches.",
};
