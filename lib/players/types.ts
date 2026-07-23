import { ncaaDivisions, type NcaaDivision } from "@/lib/college-profile";

export const DOMINANT_HAND_OPTIONS = ["Right", "Left"] as const;
export const BACKHAND_OPTIONS = ["One-handed", "Two-handed"] as const;
export const PREFERRED_NCAA_DIVISION_OPTIONS = ncaaDivisions;

export type DominantHand = (typeof DOMINANT_HAND_OPTIONS)[number];
export type BackhandType = (typeof BACKHAND_OPTIONS)[number];
export type PreferredNcaaDivision = NcaaDivision;

export type SavePlayerProfileState = {
  error: string | null;
  success: string | null;
  profileImageUrl?: string | null;
};

/** Validated payload for persisting editable player profile fields. */
export type SavePlayerProfileInput = {
  fullName: string;
  nationality: string;
  graduationYear: number | null;
  utr: number | null;
  gpa: number | null;
  height: number | null;
  weight: number | null;
  dominantHand: DominantHand | "";
  backhand: BackhandType | "";
  dateOfBirth: string;
  bio: string;
  highSchool: string;
  sat: number | null;
  toefl: number | null;
  ielts: number | null;
  duolingo: number | null;
  intendedMajor: string;
  ustaRanking: string;
  itfRanking: string;
  nationalRanking: string;
  preferredNcaaDivision: PreferredNcaaDivision | "";
  existingProfileImageUrl: string | null;
  profileImageFile: File | null;
};

/** Domain/profile edit shape (coerced empties). Not a raw DB row — see Tables<"players">. */
export type PlayerProfileRow = {
  id: string | null;
  user_id: string;
  full_name: string;
  nationality: string;
  graduation_year: number | null;
  utr: number | null;
  gpa: number | null;
  height: number | null;
  weight: number | null;
  dominant_hand: DominantHand | "";
  backhand: BackhandType | "";
  date_of_birth: string;
  bio: string;
  profile_image_url: string | null;
  high_school: string;
  sat: number | null;
  toefl: number | null;
  ielts: number | null;
  duolingo: number | null;
  intended_major: string;
  usta_ranking: string;
  itf_ranking: string;
  national_ranking: string;
  preferred_ncaa_division: PreferredNcaaDivision | "";
};

export type PlayerProfileFormValues = {
  full_name: string;
  nationality: string;
  graduation_year: string;
  utr: string;
  gpa: string;
  height: string;
  weight: string;
  dominant_hand: DominantHand | "";
  backhand: BackhandType | "";
  date_of_birth: string;
  bio: string;
  profile_image_url: string | null;
  high_school: string;
  sat: string;
  toefl: string;
  ielts: string;
  duolingo: string;
  intended_major: string;
  usta_ranking: string;
  itf_ranking: string;
  national_ranking: string;
  preferred_ncaa_division: PreferredNcaaDivision | "";
};

export const emptyPlayerProfileForm = (
  overrides?: Partial<PlayerProfileFormValues>,
): PlayerProfileFormValues => ({
  full_name: "",
  nationality: "",
  graduation_year: "",
  utr: "",
  gpa: "",
  height: "",
  weight: "",
  dominant_hand: "",
  backhand: "",
  date_of_birth: "",
  bio: "",
  profile_image_url: null,
  high_school: "",
  sat: "",
  toefl: "",
  ielts: "",
  duolingo: "",
  intended_major: "",
  usta_ranking: "",
  itf_ranking: "",
  national_ranking: "",
  preferred_ncaa_division: "",
  ...overrides,
});

function numberToFormString(value: number | null | undefined): string {
  return value != null ? String(value) : "";
}

export function toPlayerProfileFormValues(
  profile: PlayerProfileRow | null,
  fallbackName = "",
): PlayerProfileFormValues {
  if (!profile) {
    return emptyPlayerProfileForm({ full_name: fallbackName });
  }

  return {
    full_name: profile.full_name ?? "",
    nationality: profile.nationality ?? "",
    graduation_year: numberToFormString(profile.graduation_year),
    utr: numberToFormString(profile.utr),
    gpa: numberToFormString(profile.gpa),
    height: numberToFormString(profile.height),
    weight: numberToFormString(profile.weight),
    dominant_hand: profile.dominant_hand || "",
    backhand: profile.backhand || "",
    date_of_birth: profile.date_of_birth ?? "",
    bio: profile.bio ?? "",
    profile_image_url: profile.profile_image_url,
    high_school: profile.high_school ?? "",
    sat: numberToFormString(profile.sat),
    toefl: numberToFormString(profile.toefl),
    ielts: numberToFormString(profile.ielts),
    duolingo: numberToFormString(profile.duolingo),
    intended_major: profile.intended_major ?? "",
    usta_ranking: profile.usta_ranking ?? "",
    itf_ranking: profile.itf_ranking ?? "",
    national_ranking: profile.national_ranking ?? "",
    preferred_ncaa_division: profile.preferred_ncaa_division || "",
  };
}

export function isPreferredNcaaDivision(
  value: string,
): value is PreferredNcaaDivision {
  return (PREFERRED_NCAA_DIVISION_OPTIONS as readonly string[]).includes(value);
}
