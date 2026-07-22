import type { PlayerSearchRow } from "@/lib/players/search-queries";
import type { Player } from "@/lib/players";

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

export function toOptionalNumber(
  value: number | string | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

export function flagForCountry(country: string | null | undefined): string {
  if (!country) return "";
  return COUNTRY_FLAGS[country] ?? "";
}

export function ageFromDateOfBirth(
  dateOfBirth: string | null | undefined,
): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dob.getDate())
  ) {
    age -= 1;
  }
  return age > 0 ? age : null;
}

export function normalizeHandedness(
  value: string | null | undefined,
): "Right" | "Left" | null {
  if (value === "Left" || value === "Right") return value;
  return null;
}

/** Map a players row to the college list/card shape — real DB values only. */
export function mapPlayerSearchRowToPlayer(row: PlayerSearchRow): Player {
  const name = row.full_name.trim() || "Unnamed Player";
  const country = row.nationality?.trim() || "";

  return {
    id: row.id,
    name,
    country,
    countryFlag: flagForCountry(country),
    graduationYear:
      row.graduation_year != null ? String(row.graduation_year) : "",
    utr: toOptionalNumber(row.utr),
    gpa: toOptionalNumber(row.gpa),
    height: toOptionalNumber(row.height),
    weight: toOptionalNumber(row.weight),
    handedness: normalizeHandedness(row.dominant_hand),
    backhand: row.backhand?.trim() || null,
    dateOfBirth: row.date_of_birth,
    about: row.bio?.trim() || null,
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at,
    initials: initialsFromName(name),
  };
}
