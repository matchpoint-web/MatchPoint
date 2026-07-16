"use server";

import { revalidatePath } from "next/cache";
import { isNcaaDivision } from "@/lib/college-profile";
import {
  getCurrentCollegeProfile,
  saveCurrentCollegeProfile,
  type SaveCollegeProfileResult,
} from "@/lib/college-profile-service";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Server action: load college profile for client consumers if needed. */
export async function fetchCollegeProfileAction() {
  return getCurrentCollegeProfile();
}

/** Server action: save college settings from the Settings form. */
export async function saveCollegeProfileAction(
  formData: FormData,
): Promise<SaveCollegeProfileResult> {
  const ncaaDivisionRaw = getString(formData, "ncaaDivision");

  if (ncaaDivisionRaw && !isNcaaDivision(ncaaDivisionRaw)) {
    return {
      error: "Invalid NCAA division selection.",
      success: null,
      profile: null,
    };
  }

  const logo = formData.get("logoFile");
  const logoFile = logo instanceof File && logo.size > 0 ? logo : null;
  const removeLogo = getString(formData, "removeLogo") === "true";
  const existingLogoUrl = getString(formData, "existingLogoUrl") || null;

  const result = await saveCurrentCollegeProfile({
    universityName: getString(formData, "universityName"),
    ncaaDivision: isNcaaDivision(ncaaDivisionRaw) ? ncaaDivisionRaw : "",
    conference: getString(formData, "conference"),
    state: getString(formData, "state"),
    city: getString(formData, "city"),
    website: getString(formData, "website"),
    headCoach: getString(formData, "headCoach"),
    assistantCoach: getString(formData, "assistantCoach"),
    contactEmail: getString(formData, "contactEmail"),
    aboutProgram: getString(formData, "aboutProgram"),
    facilities: getString(formData, "facilities"),
    recruitingInformation: getString(formData, "recruitingInformation"),
    existingLogoUrl,
    removeLogo,
    logoFile,
  });

  if (result.success) {
    revalidatePath("/college/settings");
    revalidatePath("/college/dashboard");
    revalidatePath("/college");
  }

  return result;
}
