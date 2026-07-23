"use server";

import { revalidatePath } from "next/cache";
import { saveCurrentPlayerProfile } from "@/lib/player-profile-service";
import type {
  BackhandType,
  DominantHand,
  SavePlayerProfileState,
} from "@/lib/players/types";
import { isPreferredNcaaDivision } from "@/lib/players/types";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalNumber(value: string): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function isDominantHand(value: string): value is DominantHand {
  return value === "Right" || value === "Left";
}

function isBackhand(value: string): value is BackhandType {
  return value === "One-handed" || value === "Two-handed";
}

function validateOptionalRange(
  raw: string,
  parsed: number | null,
  label: string,
  min: number,
  max: number,
): string | null {
  if (!raw) return null;
  if (parsed == null) return `${label} must be a valid number.`;
  if (parsed < min || parsed > max) {
    return `${label} must be between ${min} and ${max}.`;
  }
  return null;
}

/** Server action: parse the edit form and persist via the profile service. */
export async function savePlayerProfile(
  _prevState: SavePlayerProfileState,
  formData: FormData,
): Promise<SavePlayerProfileState> {
  const fullName = getString(formData, "full_name");
  const nationality = getString(formData, "nationality");
  const graduationYearRaw = getString(formData, "graduation_year");
  const utrRaw = getString(formData, "utr");
  const gpaRaw = getString(formData, "gpa");
  const heightRaw = getString(formData, "height");
  const weightRaw = getString(formData, "weight");
  const dominantHand = getString(formData, "dominant_hand");
  const backhand = getString(formData, "backhand");
  const dateOfBirth = getString(formData, "date_of_birth");
  const bio = getString(formData, "bio");
  const highSchool = getString(formData, "high_school");
  const satRaw = getString(formData, "sat");
  const toeflRaw = getString(formData, "toefl");
  const ieltsRaw = getString(formData, "ielts");
  const duolingoRaw = getString(formData, "duolingo");
  const intendedMajor = getString(formData, "intended_major");
  const ustaRanking = getString(formData, "usta_ranking");
  const itfRanking = getString(formData, "itf_ranking");
  const nationalRanking = getString(formData, "national_ranking");
  const preferredNcaaDivision = getString(formData, "preferred_ncaa_division");
  const existingImageUrl = getString(formData, "existing_profile_image_url");

  if (!fullName) {
    return { error: "Full name is required.", success: null };
  }

  if (dominantHand && !isDominantHand(dominantHand)) {
    return { error: "Invalid dominant hand selection.", success: null };
  }

  if (backhand && !isBackhand(backhand)) {
    return { error: "Invalid backhand selection.", success: null };
  }

  if (preferredNcaaDivision && !isPreferredNcaaDivision(preferredNcaaDivision)) {
    return { error: "Invalid preferred NCAA division selection.", success: null };
  }

  const graduationYear = parseOptionalNumber(graduationYearRaw);
  const utr = parseOptionalNumber(utrRaw);
  const gpa = parseOptionalNumber(gpaRaw);
  const height = parseOptionalNumber(heightRaw);
  const weight = parseOptionalNumber(weightRaw);
  const sat = parseOptionalNumber(satRaw);
  const toefl = parseOptionalNumber(toeflRaw);
  const ielts = parseOptionalNumber(ieltsRaw);
  const duolingo = parseOptionalNumber(duolingoRaw);

  if (graduationYearRaw && graduationYear == null) {
    return { error: "Graduation year must be a valid number.", success: null };
  }
  if (utrRaw && utr == null) {
    return { error: "UTR must be a valid number.", success: null };
  }
  if (gpaRaw && gpa == null) {
    return { error: "GPA must be a valid number.", success: null };
  }
  if (heightRaw && height == null) {
    return { error: "Height must be a valid number.", success: null };
  }
  if (weightRaw && weight == null) {
    return { error: "Weight must be a valid number.", success: null };
  }

  const rangeError =
    validateOptionalRange(satRaw, sat, "SAT", 400, 1600) ??
    validateOptionalRange(toeflRaw, toefl, "TOEFL", 0, 120) ??
    validateOptionalRange(ieltsRaw, ielts, "IELTS", 0, 9) ??
    validateOptionalRange(duolingoRaw, duolingo, "Duolingo", 10, 160);

  if (rangeError) {
    return { error: rangeError, success: null };
  }

  const image = formData.get("profile_image");
  const profileImageFile =
    image instanceof File && image.size > 0 ? image : null;

  const result = await saveCurrentPlayerProfile({
    fullName,
    nationality,
    graduationYear,
    utr,
    gpa,
    height,
    weight,
    dominantHand: isDominantHand(dominantHand) ? dominantHand : "",
    backhand: isBackhand(backhand) ? backhand : "",
    dateOfBirth,
    bio,
    highSchool,
    sat,
    toefl,
    ielts,
    duolingo,
    intendedMajor,
    ustaRanking,
    itfRanking,
    nationalRanking,
    preferredNcaaDivision: isPreferredNcaaDivision(preferredNcaaDivision)
      ? preferredNcaaDivision
      : "",
    existingProfileImageUrl: existingImageUrl || null,
    profileImageFile,
  });

  if (result.success) {
    revalidatePath("/player/profile");
    revalidatePath("/player/profile/edit");
    revalidatePath("/player");
  }

  return result;
}
