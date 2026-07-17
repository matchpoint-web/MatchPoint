"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type {
  BackhandType,
  DominantHand,
  SavePlayerProfileState,
} from "@/lib/players/types";

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

async function uploadProfileImage(
  userId: string,
  file: File,
): Promise<string> {
  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("player-avatars")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("player-avatars").getPublicUrl(path);

  return publicUrl;
}

export async function savePlayerProfile(
  _prevState: SavePlayerProfileState,
  formData: FormData,
): Promise<SavePlayerProfileState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "You must be logged in to save your profile.", success: null };
    }

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

    const graduationYear = parseOptionalNumber(graduationYearRaw);
    const utr = parseOptionalNumber(utrRaw);
    const gpa = parseOptionalNumber(gpaRaw);
    const height = parseOptionalNumber(heightRaw);
    const weight = parseOptionalNumber(weightRaw);

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

    let profileImageUrl = existingImageUrl || null;
    const image = formData.get("profile_image");

    if (image instanceof File && image.size > 0) {
      if (!image.type.startsWith("image/")) {
        return { error: "Profile image must be an image file.", success: null };
      }
      if (image.size > 5 * 1024 * 1024) {
        return { error: "Profile image must be 5MB or smaller.", success: null };
      }
      profileImageUrl = await uploadProfileImage(user.id, image);
    }

    const payload = {
      user_id: user.id,
      full_name: fullName,
      nationality: nationality || null,
      graduation_year: graduationYear,
      utr,
      gpa,
      height,
      weight,
      dominant_hand: dominantHand || null,
      backhand: backhand || null,
      date_of_birth: dateOfBirth || null,
      bio: bio || null,
      profile_image_url: profileImageUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("players").upsert(payload, {
      onConflict: "user_id",
    });

    if (error) {
      return { error: error.message, success: null };
    }

    await supabase.auth.updateUser({
      data: { full_name: fullName },
    });

    revalidatePath("/player/profile");
    revalidatePath("/player/profile/edit");
    revalidatePath("/player");

    return {
      error: null,
      success: "Profile saved successfully.",
      profileImageUrl,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save profile.";
    return { error: message, success: null };
  }
}
