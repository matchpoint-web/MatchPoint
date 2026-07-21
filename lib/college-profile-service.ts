import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/database.types";
import { getUserRole } from "@/lib/auth/utils";
import {
  getEmptyCollegeProfile,
  isNcaaDivision,
  type CollegeProfile,
  type NcaaDivision,
} from "@/lib/college-profile";

export type CollegeRow = Tables<"colleges">;

const COLLEGE_SELECT =
  "id, user_id, school_name, division, location, conference, state, city, website, head_coach, assistant_coach, contact_email, about_program, facilities, recruiting_information, logo_url, created_at, updated_at";

export type SaveCollegeProfileInput = {
  universityName: string;
  ncaaDivision: NcaaDivision | "";
  conference: string;
  state: string;
  city: string;
  website: string;
  headCoach: string;
  assistantCoach: string;
  contactEmail: string;
  aboutProgram: string;
  facilities: string;
  recruitingInformation: string;
  existingLogoUrl: string | null;
  removeLogo: boolean;
  logoFile: File | null;
};

export type SaveCollegeProfileResult = {
  error: string | null;
  success: string | null;
  profile: CollegeProfile | null;
};

function textOrEmpty(value: string | null | undefined): string {
  return value?.trim() ?? "";
}

function mapDivision(value: string | null | undefined): NcaaDivision | "" {
  if (!value) return "";
  return isNcaaDivision(value) ? value : "";
}

export function mapCollegeRowToProfile(row: CollegeRow): CollegeProfile {
  return {
    logoDataUrl: row.logo_url,
    universityName: textOrEmpty(row.school_name),
    ncaaDivision: mapDivision(row.division),
    conference: textOrEmpty(row.conference),
    state: textOrEmpty(row.state),
    city: textOrEmpty(row.city),
    website: textOrEmpty(row.website),
    headCoach: textOrEmpty(row.head_coach),
    assistantCoach: textOrEmpty(row.assistant_coach),
    contactEmail: textOrEmpty(row.contact_email),
    aboutProgram: textOrEmpty(row.about_program),
    facilities: textOrEmpty(row.facilities),
    recruitingInformation: textOrEmpty(row.recruiting_information),
  };
}

/**
 * Resolve the authenticated college's row id.
 * Creates a colleges row if the account exists but has no profile yet.
 */
export async function getCurrentCollegeId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;
  if (getUserRole(user) !== "college") return null;

  const { data: existing, error: selectError } = await supabase
    .from("colleges")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selectError) {
    throw new Error(selectError.message);
  }

  if (existing?.id) {
    return existing.id as string;
  }

  const schoolName =
    typeof user.user_metadata?.school_name === "string" &&
    user.user_metadata.school_name.trim()
      ? user.user_metadata.school_name.trim()
      : "My College";

  const { data: created, error: insertError } = await supabase
    .from("colleges")
    .insert({
      user_id: user.id,
      school_name: schoolName,
    })
    .select("id")
    .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return (created?.id as string) ?? null;
}

async function getCurrentCollegeRow(): Promise<{
  row: CollegeRow | null;
  userId: string;
  fallbackSchoolName: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const fallbackSchoolName =
    typeof user.user_metadata?.school_name === "string"
      ? user.user_metadata.school_name
      : "";

  const collegeId = await getCurrentCollegeId();
  if (!collegeId) {
    return { row: null, userId: user.id, fallbackSchoolName };
  }

  const { data, error } = await supabase
    .from("colleges")
    .select(COLLEGE_SELECT)
    .eq("id", collegeId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    row: (data as CollegeRow | null) ?? null,
    userId: user.id,
    fallbackSchoolName,
  };
}

/** Load the authenticated college's program profile from Supabase. */
export async function getCurrentCollegeProfile(): Promise<CollegeProfile> {
  const { row, fallbackSchoolName } = await getCurrentCollegeRow();

  if (!row) {
    const empty = getEmptyCollegeProfile();
    return {
      ...empty,
      universityName: fallbackSchoolName,
    };
  }

  const mapped = mapCollegeRowToProfile(row);
  if (!mapped.universityName && fallbackSchoolName) {
    return { ...mapped, universityName: fallbackSchoolName };
  }
  return mapped;
}

async function uploadCollegeLogo(
  userId: string,
  file: File,
): Promise<string> {
  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("college-logos")
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
  } = supabase.storage.from("college-logos").getPublicUrl(path);

  return publicUrl;
}

/** Persist the authenticated college's program profile to public.colleges. */
export async function saveCurrentCollegeProfile(
  input: SaveCollegeProfileInput,
): Promise<SaveCollegeProfileResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || getUserRole(user) !== "college") {
      return {
        error: "You must be logged in as a college to save settings.",
        success: null,
        profile: null,
      };
    }

    const universityName = input.universityName.trim();
    const contactEmail = input.contactEmail.trim();

    if (!universityName) {
      return {
        error: "University name is required.",
        success: null,
        profile: null,
      };
    }

    if (!contactEmail) {
      return {
        error: "Contact email is required.",
        success: null,
        profile: null,
      };
    }

    if (input.ncaaDivision && !isNcaaDivision(input.ncaaDivision)) {
      return {
        error: "Invalid NCAA division selection.",
        success: null,
        profile: null,
      };
    }

    let logoUrl = input.removeLogo ? null : input.existingLogoUrl;

    if (input.logoFile && input.logoFile.size > 0) {
      if (!input.logoFile.type.startsWith("image/")) {
        return {
          error: "Logo must be an image file.",
          success: null,
          profile: null,
        };
      }
      if (input.logoFile.size > 2 * 1024 * 1024) {
        return {
          error: "Logo must be 2MB or smaller.",
          success: null,
          profile: null,
        };
      }
      logoUrl = await uploadCollegeLogo(user.id, input.logoFile);
    }

    const collegeId = await getCurrentCollegeId();
    if (!collegeId) {
      return {
        error: "College profile could not be found.",
        success: null,
        profile: null,
      };
    }

    const city = input.city.trim();
    const state = input.state.trim();
    const location =
      city && state ? `${city}, ${state}` : city || state || null;

    const payload = {
      school_name: universityName,
      division: input.ncaaDivision || null,
      location,
      conference: input.conference.trim() || null,
      state: state || null,
      city: city || null,
      website: input.website.trim() || null,
      head_coach: input.headCoach.trim() || null,
      assistant_coach: input.assistantCoach.trim() || null,
      contact_email: contactEmail,
      about_program: input.aboutProgram.trim() || null,
      facilities: input.facilities.trim() || null,
      recruiting_information: input.recruitingInformation.trim() || null,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("colleges")
      .update(payload)
      .eq("id", collegeId)
      .eq("user_id", user.id)
      .select(COLLEGE_SELECT)
      .single();

    if (error) {
      return { error: error.message, success: null, profile: null };
    }

    await supabase.auth.updateUser({
      data: { school_name: universityName },
    });

    const profile = mapCollegeRowToProfile(data as CollegeRow);

    return {
      error: null,
      success: "Settings saved successfully.",
      profile,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save settings.";
    return { error: message, success: null, profile: null };
  }
}
