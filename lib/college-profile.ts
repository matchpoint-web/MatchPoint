/**
 * Shared college profile data layer.
 * UI components must use these helpers only — never read/write storage directly.
 * Future Supabase migration should change this file alone.
 */

export const COLLEGE_PROFILE_STORAGE_KEY = "college_settings";

export const ncaaDivisions = [
  "NCAA D1",
  "NCAA D2",
  "NCAA D3",
  "NAIA",
  "Junior College",
] as const;

export type NcaaDivision = (typeof ncaaDivisions)[number];

export type CollegeProfile = {
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

export function getDefaultCollegeProfile(): CollegeProfile {
  return {
    logoDataUrl: null,
    universityName: "Stanford University",
    ncaaDivision: "NCAA D1",
    conference: "ACC",
    state: "CA",
    city: "Stanford",
    website: "https://gostanford.com/sports/mens-tennis",
    headCoach: "Coach Michael Rivera",
    assistantCoach: "",
    contactEmail: "recruiting@stanford.edu",
    aboutProgram:
      "Stanford Men's Tennis balances elite competition with world-class academics and a strong tradition of developing complete student-athletes.",
    facilities:
      "Taube Family Tennis Stadium, outdoor hard courts, strength & conditioning access, and sports medicine support.",
    recruitingInformation:
      "We evaluate academic fit, competitive UTR, character, and long-term program contribution. International applicants are welcome.",
  };
}

function isNcaaDivision(value: unknown): value is NcaaDivision {
  return (
    typeof value === "string" &&
    (ncaaDivisions as readonly string[]).includes(value)
  );
}

function isCollegeProfile(value: unknown): value is CollegeProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;

  return (
    (profile.logoDataUrl === null || typeof profile.logoDataUrl === "string") &&
    typeof profile.universityName === "string" &&
    (profile.ncaaDivision === "" || isNcaaDivision(profile.ncaaDivision)) &&
    typeof profile.conference === "string" &&
    typeof profile.state === "string" &&
    typeof profile.city === "string" &&
    typeof profile.website === "string" &&
    typeof profile.headCoach === "string" &&
    typeof profile.assistantCoach === "string" &&
    typeof profile.contactEmail === "string" &&
    typeof profile.aboutProgram === "string" &&
    typeof profile.facilities === "string" &&
    typeof profile.recruitingInformation === "string"
  );
}

function notifyCollegeProfileUpdated(profile: CollegeProfile): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<CollegeProfile>(COLLEGE_PROFILE_UPDATED_EVENT, {
      detail: profile,
    }),
  );
}

export function getCollegeProfile(): CollegeProfile {
  const defaults = getDefaultCollegeProfile();

  if (typeof window === "undefined") {
    return defaults;
  }

  try {
    const raw = localStorage.getItem(COLLEGE_PROFILE_STORAGE_KEY);
    if (!raw) return defaults;

    const parsed: unknown = JSON.parse(raw);
    if (!isCollegeProfile(parsed)) {
      return defaults;
    }

    return {
      ...defaults,
      ...parsed,
    };
  } catch {
    return defaults;
  }
}

export function saveCollegeProfile(profile: CollegeProfile): CollegeProfile {
  const payload: CollegeProfile = {
    logoDataUrl: profile.logoDataUrl,
    universityName: profile.universityName.trim(),
    ncaaDivision: profile.ncaaDivision,
    conference: profile.conference.trim(),
    state: profile.state.trim(),
    city: profile.city.trim(),
    website: profile.website.trim(),
    headCoach: profile.headCoach.trim(),
    assistantCoach: profile.assistantCoach.trim(),
    contactEmail: profile.contactEmail.trim(),
    aboutProgram: profile.aboutProgram.trim(),
    facilities: profile.facilities.trim(),
    recruitingInformation: profile.recruitingInformation.trim(),
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(COLLEGE_PROFILE_STORAGE_KEY, JSON.stringify(payload));
    notifyCollegeProfileUpdated(payload);
  }

  return payload;
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
