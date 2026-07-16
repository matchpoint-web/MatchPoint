/**
 * College profile types and display helpers.
 * Persistence lives in lib/college-profile-service.ts (Supabase).
 */

export const ncaaDivisions = [
  "NCAA D1",
  "NCAA D2",
  "NCAA D3",
  "NAIA",
  "Junior College",
] as const;

export type NcaaDivision = (typeof ncaaDivisions)[number];

export type CollegeProfile = {
  /** Display URL for logo (Storage public URL or local preview data URL). */
  logoDataUrl: string | null;
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
};

/** Fired after a successful save so client UI can refresh without remounting. */
export const COLLEGE_PROFILE_UPDATED_EVENT = "matchpoint:college-profile-updated";

export function getEmptyCollegeProfile(): CollegeProfile {
  return {
    logoDataUrl: null,
    universityName: "",
    ncaaDivision: "",
    conference: "",
    state: "",
    city: "",
    website: "",
    headCoach: "",
    assistantCoach: "",
    contactEmail: "",
    aboutProgram: "",
    facilities: "",
    recruitingInformation: "",
  };
}

/** Stable empty defaults for SSR / player portal (no college context). */
export function getDefaultCollegeProfile(): CollegeProfile {
  return getEmptyCollegeProfile();
}

export function isNcaaDivision(value: unknown): value is NcaaDivision {
  return (
    typeof value === "string" &&
    (ncaaDivisions as readonly string[]).includes(value)
  );
}

export function notifyCollegeProfileUpdated(profile: CollegeProfile): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CollegeProfile>(COLLEGE_PROFILE_UPDATED_EVENT, {
      detail: profile,
    }),
  );
}

export function getUniversityInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
