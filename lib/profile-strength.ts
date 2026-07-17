export type ProfileStrengthItem = {
  label: string;
  complete: boolean;
};

export type ProfileStrength = {
  score: number;
  items: ProfileStrengthItem[];
  message: string;
};

/** Fallback only — prefer buildProfileStrength() from player-profile-service. */
export const defaultProfileStrength: ProfileStrength = {
  score: 0,
  items: [
    { label: "Profile Photo Missing", complete: false },
    { label: "Biography Missing", complete: false },
    { label: "Academic Information Incomplete", complete: false },
    { label: "UTR Missing", complete: false },
    { label: "Physical Stats Incomplete", complete: false },
    { label: "Playing Hand Missing", complete: false },
  ],
  message:
    "Complete your profile to improve your visibility to college coaches.",
};
