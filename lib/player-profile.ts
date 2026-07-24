export type PlayerProfile = {
  name: string;
  country: string;
  countryFlag: string;
  age: number;
  graduationYear: string;
  utr: string;
  gpa: string;
  height: string;
  weight: string;
  handedness: string;
  about: string;
  completion: number;
  profileImageUrl?: string | null;
};

/** Display copy for empty optional Player Profile fields. */
export const OPTIONAL_PROFILE_PLACEHOLDER = "Not Provided (Optional)";

/** Format an optional profile value for Player Profile UI (never for loading/errors). */
export function displayOptionalProfileValue(
  value: string | number | null | undefined,
): string {
  if (value == null) return OPTIONAL_PROFILE_PLACEHOLDER;
  const text = String(value).trim();
  return text ? text : OPTIONAL_PROFILE_PLACEHOLDER;
}

export function isOptionalProfilePlaceholder(value: string): boolean {
  return value.trim() === OPTIONAL_PROFILE_PLACEHOLDER;
}

export type HighlightVideo = {
  id: string;
  title: string;
  url: string;
  embedUrl: string;
  provider: "youtube" | "vimeo";
};

export type Achievement = {
  id: string;
  title: string;
  year: string;
  description: string;
};

export type DocumentItem = {
  id: string;
  name: string;
  status: "uploaded" | "missing";
};
