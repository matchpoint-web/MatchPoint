export const DOMINANT_HAND_OPTIONS = ["Right", "Left"] as const;
export const BACKHAND_OPTIONS = ["One-handed", "Two-handed"] as const;

export type DominantHand = (typeof DOMINANT_HAND_OPTIONS)[number];
export type BackhandType = (typeof BACKHAND_OPTIONS)[number];

export type SavePlayerProfileState = {
  error: string | null;
  success: string | null;
  profileImageUrl?: string | null;
};

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
  ...overrides,
});

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
    graduation_year:
      profile.graduation_year != null ? String(profile.graduation_year) : "",
    utr: profile.utr != null ? String(profile.utr) : "",
    gpa: profile.gpa != null ? String(profile.gpa) : "",
    height: profile.height != null ? String(profile.height) : "",
    weight: profile.weight != null ? String(profile.weight) : "",
    dominant_hand: profile.dominant_hand || "",
    backhand: profile.backhand || "",
    date_of_birth: profile.date_of_birth ?? "",
    bio: profile.bio ?? "",
    profile_image_url: profile.profile_image_url,
  };
}
