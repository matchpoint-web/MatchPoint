import { requirePlayer } from "@/lib/auth/actions";
import {
  type DocumentItem,
  type HighlightVideo,
  type PlayerProfile,
  displayOptionalProfileValue,
} from "@/lib/player-profile";
import {
  ensureCurrentPlayerId,
  getCurrentPlayerProfile,
  PLAYER_PROFILE_SELECT,
} from "@/lib/players/queries";
import type {
  PlayerProfileRow,
  SavePlayerProfileInput,
  SavePlayerProfileState,
} from "@/lib/players/types";
import {
  type ProfileStrength,
  type ProfileStrengthItem,
} from "@/lib/profile-strength";
import { createClient } from "@/lib/supabase/server";
import {
  assertAvatarFile,
  AVATARS_BUCKET,
  buildAvatarStoragePath,
  removeStorageObject,
  uploadStorageObject,
} from "@/lib/storage/queries";

export type InfoGridItem = { label: string; value: string };

export type PlayerDashboardProfile = {
  name: string;
  country: string;
  graduationYear: string;
  utr: string;
  gpa: string;
  completion: number;
  remainingSections: number;
  profileImageUrl: string | null;
};

export type PlayerProfileViewModel = {
  profile: PlayerProfile & { profileImageUrl: string | null };
  academicInfo: InfoGridItem[];
  tennisInfo: InfoGridItem[];
  highlightVideos: HighlightVideo[];
  documents: DocumentItem[];
  strength: ProfileStrength;
  remainingSections: number;
};

const COUNTRY_FLAGS: Record<string, string> = {
  "United States": "🇺🇸",
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Argentina: "🇦🇷",
  Chile: "🇨🇱",
  Colombia: "🇨🇴",
  Peru: "🇵🇪",
  "United Kingdom": "🇬🇧",
  France: "🇫🇷",
  Germany: "🇩🇪",
  Spain: "🇪🇸",
  Italy: "🇮🇹",
  Netherlands: "🇳🇱",
  Belgium: "🇧🇪",
  Sweden: "🇸🇪",
  Norway: "🇳🇴",
  Denmark: "🇩🇰",
  Switzerland: "🇨🇭",
  "Czech Republic": "🇨🇿",
  Serbia: "🇷🇸",
  Croatia: "🇭🇷",
  Poland: "🇵🇱",
  Austria: "🇦🇹",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  China: "🇨🇳",
  "Chinese Taipei": "🇹🇼",
  "Hong Kong": "🇭🇰",
  Thailand: "🇹🇭",
  Malaysia: "🇲🇾",
  Singapore: "🇸🇬",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
  India: "🇮🇳",
  Vietnam: "🇻🇳",
  Australia: "🇦🇺",
  "New Zealand": "🇳🇿",
  "South Africa": "🇿🇦",
  Morocco: "🇲🇦",
  Egypt: "🇪🇬",
  Ireland: "🇮🇪",
};

type CompletionField = {
  key: string;
  filled: boolean;
  section: string;
};

function flagForCountry(country: string): string {
  if (!country) return "";
  return COUNTRY_FLAGS[country] ?? "";
}

function ageFromDateOfBirth(dateOfBirth: string | null | undefined): number {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age > 0 ? age : 0;
}

function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(Number(value))) {
    return displayOptionalProfileValue(null);
  }
  return Number(value).toFixed(digits);
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim());
}

function hasNumber(value: number | null | undefined): boolean {
  return value != null && Number.isFinite(Number(value));
}

function emptyRow(userId: string, fallbackName: string): PlayerProfileRow {
  return {
    id: null,
    user_id: userId,
    full_name: fallbackName,
    nationality: "",
    graduation_year: null,
    utr: null,
    gpa: null,
    height: null,
    weight: null,
    dominant_hand: "",
    backhand: "",
    date_of_birth: "",
    bio: "",
    profile_image_url: null,
    high_school: "",
    sat: null,
    toefl: null,
    ielts: null,
    duolingo: null,
    intended_major: "",
    usta_ranking: "",
    itf_ranking: "",
    national_ranking: "",
    preferred_ncaa_division: "",
  };
}

function normalizeRow(row: PlayerProfileRow): PlayerProfileRow {
  return {
    ...row,
    full_name: row.full_name ?? "",
    nationality: row.nationality ?? "",
    dominant_hand: row.dominant_hand || "",
    backhand: row.backhand || "",
    date_of_birth: row.date_of_birth ?? "",
    bio: row.bio ?? "",
    profile_image_url: row.profile_image_url ?? null,
    high_school: row.high_school ?? "",
    intended_major: row.intended_major ?? "",
    usta_ranking: row.usta_ranking ?? "",
    itf_ranking: row.itf_ranking ?? "",
    national_ranking: row.national_ranking ?? "",
    preferred_ncaa_division: row.preferred_ncaa_division || "",
  };
}

function getCompletionFields(row: PlayerProfileRow): CompletionField[] {
  return [
    {
      key: "full_name",
      filled: hasText(row.full_name),
      section: "Basic info",
    },
    {
      key: "nationality",
      filled: hasText(row.nationality),
      section: "Basic info",
    },
    {
      key: "date_of_birth",
      filled: hasText(row.date_of_birth),
      section: "Basic info",
    },
    {
      key: "graduation_year",
      filled: hasNumber(row.graduation_year),
      section: "Academics",
    },
    {
      key: "gpa",
      filled: hasNumber(row.gpa),
      section: "Academics",
    },
    {
      key: "utr",
      filled: hasNumber(row.utr),
      section: "Tennis",
    },
    {
      key: "dominant_hand",
      filled: hasText(row.dominant_hand),
      section: "Tennis",
    },
    {
      key: "backhand",
      filled: hasText(row.backhand),
      section: "Tennis",
    },
    {
      key: "height",
      filled: hasNumber(row.height),
      section: "Physical",
    },
    {
      key: "weight",
      filled: hasNumber(row.weight),
      section: "Physical",
    },
    {
      key: "bio",
      filled: hasText(row.bio),
      section: "Biography",
    },
    {
      key: "profile_image_url",
      filled: hasText(row.profile_image_url),
      section: "Profile photo",
    },
  ];
}

/** Percent complete from filled profile fields (0–100). */
export function calculateProfileCompletion(row: PlayerProfileRow): number {
  const fields = getCompletionFields(row);
  if (fields.length === 0) return 0;
  const filled = fields.filter((field) => field.filled).length;
  return Math.round((filled / fields.length) * 100);
}

/** Count of incomplete high-level sections for UI copy. */
export function countRemainingSections(row: PlayerProfileRow): number {
  const fields = getCompletionFields(row);
  const incompleteSections = new Set(
    fields.filter((field) => !field.filled).map((field) => field.section),
  );
  return incompleteSections.size;
}

export function buildProfileStrength(row: PlayerProfileRow): ProfileStrength {
  const completion = calculateProfileCompletion(row);
  const remaining = countRemainingSections(row);

  const items: ProfileStrengthItem[] = [
    {
      label: hasText(row.profile_image_url)
        ? "Profile Photo"
        : "Profile Photo Missing",
      complete: hasText(row.profile_image_url),
    },
    {
      label: hasText(row.bio) ? "Biography" : "Biography Missing",
      complete: hasText(row.bio),
    },
    {
      label:
        hasNumber(row.gpa) && hasNumber(row.graduation_year)
          ? "Academic Information"
          : "Academic Information Incomplete",
      complete: hasNumber(row.gpa) && hasNumber(row.graduation_year),
    },
    {
      label: hasNumber(row.utr) ? "UTR Verified" : "UTR Missing",
      complete: hasNumber(row.utr),
    },
    {
      label:
        hasNumber(row.height) && hasNumber(row.weight)
          ? "Physical Stats"
          : "Physical Stats Incomplete",
      complete: hasNumber(row.height) && hasNumber(row.weight),
    },
    {
      label: hasText(row.dominant_hand)
        ? "Playing Hand"
        : "Playing Hand Missing",
      complete: hasText(row.dominant_hand),
    },
  ];

  const message =
    remaining === 0
      ? "Your recruiting profile looks complete."
      : `Complete ${remaining} more section${remaining === 1 ? "" : "s"} to improve your visibility to college coaches.`;

  return {
    score: completion,
    items,
    message,
  };
}

function mapRowToPlayerProfile(
  row: PlayerProfileRow,
): PlayerProfile & { profileImageUrl: string | null } {
  const country = row.nationality?.trim() || "";
  const handedness = row.dominant_hand
    ? `${row.dominant_hand}-handed`
    : displayOptionalProfileValue(null);

  return {
    name: row.full_name?.trim() || "Player",
    country: displayOptionalProfileValue(country),
    countryFlag: flagForCountry(country),
    age: ageFromDateOfBirth(row.date_of_birth),
    graduationYear: displayOptionalProfileValue(row.graduation_year),
    utr: formatNumber(row.utr, 1),
    gpa: formatNumber(row.gpa, 1),
    height: hasNumber(row.height)
      ? `${Number(row.height)} cm`
      : displayOptionalProfileValue(null),
    weight: hasNumber(row.weight)
      ? `${Number(row.weight)} kg`
      : displayOptionalProfileValue(null),
    handedness,
    about: displayOptionalProfileValue(row.bio),
    completion: calculateProfileCompletion(row),
    profileImageUrl: row.profile_image_url,
  };
}

function buildAcademicInfo(row: PlayerProfileRow): InfoGridItem[] {
  return [
    { label: "High School", value: displayOptionalProfileValue(row.high_school) },
    {
      label: "Expected Graduation",
      value: hasNumber(row.graduation_year)
        ? `June ${row.graduation_year}`
        : displayOptionalProfileValue(null),
    },
    {
      label: "GPA",
      value: hasNumber(row.gpa)
        ? `${Number(row.gpa).toFixed(1)} / 4.0`
        : displayOptionalProfileValue(null),
    },
    { label: "SAT", value: displayOptionalProfileValue(row.sat) },
    { label: "TOEFL", value: displayOptionalProfileValue(row.toefl) },
    {
      label: "IELTS",
      value: hasNumber(row.ielts)
        ? Number(row.ielts).toFixed(1)
        : displayOptionalProfileValue(null),
    },
    { label: "Duolingo", value: displayOptionalProfileValue(row.duolingo) },
    {
      label: "Intended Major",
      value: displayOptionalProfileValue(row.intended_major),
    },
  ];
}

function buildTennisInfo(row: PlayerProfileRow): InfoGridItem[] {
  return [
    { label: "UTR", value: formatNumber(row.utr, 1) },
    {
      label: "USTA Ranking",
      value: displayOptionalProfileValue(row.usta_ranking),
    },
    {
      label: "ITF Ranking",
      value: displayOptionalProfileValue(row.itf_ranking),
    },
    {
      label: "National Ranking",
      value: displayOptionalProfileValue(row.national_ranking),
    },
    {
      label: "Preferred NCAA Division",
      value: displayOptionalProfileValue(row.preferred_ncaa_division),
    },
  ];
}

function buildDocumentItems(): DocumentItem[] {
  return [
    { id: "transcript", name: "Transcript", status: "missing" },
    { id: "english-test", name: "English Test", status: "missing" },
  ];
}

/**
 * Load the authenticated player's profile for dashboard + profile pages.
 * All Supabase access stays in this service / players queries layer.
 */
export async function getPlayerProfileView(): Promise<PlayerProfileViewModel> {
  const { profile, userId, fallbackName } = await getCurrentPlayerProfile();
  const row = normalizeRow(profile ?? emptyRow(userId, fallbackName));

  return {
    profile: mapRowToPlayerProfile(row),
    academicInfo: buildAcademicInfo(row),
    tennisInfo: buildTennisInfo(row),
    highlightVideos: [],
    documents: buildDocumentItems(),
    strength: buildProfileStrength(row),
    remainingSections: countRemainingSections(row),
  };
}

/** Edit page: raw row + fallback name from auth metadata. */
export async function getPlayerProfileForEdit() {
  return getCurrentPlayerProfile();
}

function avatarPathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/object/public/${AVATARS_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(
    url.slice(index + marker.length).split("?")[0] ?? "",
  );
}

async function uploadProfileImage(
  playerId: string,
  file: File,
  previousPublicUrl: string | null,
): Promise<string> {
  assertAvatarFile(file);

  const storagePath = buildAvatarStoragePath(playerId, file);
  const uploaded = await uploadStorageObject({
    bucket: AVATARS_BUCKET,
    path: storagePath,
    file,
    upsert: true,
  });

  const previousPath = avatarPathFromPublicUrl(previousPublicUrl);
  if (previousPath && previousPath !== uploaded.storagePath) {
    try {
      await removeStorageObject(AVATARS_BUCKET, previousPath);
    } catch {
      // Best-effort cleanup when extension changes.
    }
  }

  if (!uploaded.publicUrl) {
    throw new Error("Failed to resolve avatar public URL.");
  }

  return uploaded.publicUrl;
}

/**
 * Persist editable player profile fields to `players`.
 * Creates a row if missing, then updates the owned row.
 */
export async function saveCurrentPlayerProfile(
  input: SavePlayerProfileInput,
): Promise<SavePlayerProfileState> {
  try {
    const user = await requirePlayer();

    const fullName = input.fullName.trim();
    if (!fullName) {
      return { error: "Full name is required.", success: null };
    }

    const supabase = await createClient();
    const playerId = await ensureCurrentPlayerId();
    let profileImageUrl = input.existingProfileImageUrl;

    if (input.profileImageFile && input.profileImageFile.size > 0) {
      try {
        profileImageUrl = await uploadProfileImage(
          playerId,
          input.profileImageFile,
          input.existingProfileImageUrl,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to upload image.";
        return { error: message, success: null };
      }
    }

    const payload = {
      full_name: fullName,
      nationality: input.nationality.trim() || null,
      graduation_year: input.graduationYear,
      utr: input.utr,
      gpa: input.gpa,
      height: input.height,
      weight: input.weight,
      dominant_hand: input.dominantHand || null,
      backhand: input.backhand || null,
      date_of_birth: input.dateOfBirth.trim() || null,
      bio: input.bio.trim() || null,
      profile_image_url: profileImageUrl,
      high_school: input.highSchool.trim() || null,
      sat: input.sat,
      toefl: input.toefl,
      ielts: input.ielts,
      duolingo: input.duolingo,
      intended_major: input.intendedMajor.trim() || null,
      usta_ranking: input.ustaRanking.trim() || null,
      itf_ranking: input.itfRanking.trim() || null,
      national_ranking: input.nationalRanking.trim() || null,
      preferred_ncaa_division: input.preferredNcaaDivision || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("players")
      .update(payload)
      .eq("id", playerId)
      .eq("user_id", user.id)
      .select(PLAYER_PROFILE_SELECT)
      .single();

    if (error) {
      return { error: error.message, success: null };
    }

    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    const row = data as PlayerProfileRow | null;

    return {
      error: null,
      success: "Profile saved successfully.",
      profileImageUrl: row?.profile_image_url ?? profileImageUrl,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save profile.";
    return { error: message, success: null };
  }
}
