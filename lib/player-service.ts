import { createClient } from "@/lib/supabase/server";
import {
  type AcademicTest,
  type MockPlayer,
  type PreferredDivision,
} from "@/lib/mock-players";
import { defaultProfileStrength } from "@/lib/profile-strength";

/** UI player shape for search cards and lists. Source-agnostic. */
export type Player = MockPlayer;

export type PlayerDetail = Player & {
  age: number;
  currentSchool: string;
  about: string;
  academics: {
    highSchool: string;
    graduationDate: string;
    gpa: string;
    sat: string;
    act: string;
    toefl: string;
    ielts: string;
    duolingo: string;
    intendedMajor: string;
  };
  tennis: {
    utr: string;
    itfRanking: string;
    nationalRanking: string;
    ustaRanking: string;
    preferredDivision: string;
    playingStyle: string;
    dominantHand: string;
    backhand: string;
    height: string;
  };
  videos: { id: string; title: string; duration: string }[];
  tournaments: {
    id: string;
    title: string;
    year: string;
    description: string;
  }[];
  documents: { id: string; name: string; status: "available" | "missing" }[];
  coachNotes: string[];
  profileStrength: typeof defaultProfileStrength;
  profileImageUrl: string | null;
};

type PlayerRow = {
  id: string;
  full_name: string;
  nationality: string | null;
  graduation_year: number | null;
  utr: number | string | null;
  gpa: number | string | null;
  height: number | string | null;
  weight: number | string | null;
  dominant_hand: string | null;
  backhand: string | null;
  date_of_birth: string | null;
  bio: string | null;
  profile_image_url: string | null;
  created_at: string;
};

const PLAYER_SELECT =
  "id, full_name, nationality, graduation_year, utr, gpa, height, weight, dominant_hand, backhand, date_of_birth, bio, profile_image_url, created_at";

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

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value == null || value === "") return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function flagForCountry(country: string): string {
  if (!country) return "";
  return COUNTRY_FLAGS[country] ?? "";
}

function normalizeHandedness(value: string | null): "Right" | "Left" {
  return value === "Left" ? "Left" : "Right";
}

function ageFromDateOfBirth(dateOfBirth: string | null): number {
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

function mapRowToPlayer(row: PlayerRow): Player {
  const handedness = normalizeHandedness(row.dominant_hand);
  const country = row.nationality ?? "";

  return {
    id: row.id,
    name: row.full_name || "Unnamed Player",
    country,
    countryFlag: flagForCountry(country),
    graduationYear:
      row.graduation_year != null ? String(row.graduation_year) : "",
    utr: toNumber(row.utr),
    gpa: toNumber(row.gpa),
    division: "NCAA D1" as PreferredDivision,
    playingStyle: "",
    major: "",
    academicTest: "Other" as AcademicTest,
    height: toNumber(row.height),
    weight: toNumber(row.weight),
    handedness,
    createdAt: row.created_at,
    initials: initialsFromName(row.full_name || "Unnamed Player"),
  };
}

function mapRowToPlayerDetail(row: PlayerRow): PlayerDetail {
  const base = mapRowToPlayer(row);
  const dominantHand = row.dominant_hand?.trim() || base.handedness;
  const backhand = row.backhand?.trim() || "—";
  const heightLabel =
    row.height != null && row.height !== ""
      ? `${toNumber(row.height)} cm`
      : "—";
  const gpaLabel =
    row.gpa != null && row.gpa !== ""
      ? `${toNumber(row.gpa).toFixed(1)} / 4.0`
      : "—";
  const utrLabel =
    row.utr != null && row.utr !== "" ? toNumber(row.utr).toFixed(1) : "—";

  return {
    ...base,
    age: ageFromDateOfBirth(row.date_of_birth),
    currentSchool: "—",
    about: row.bio?.trim() || "",
    academics: {
      highSchool: "—",
      graduationDate: base.graduationYear
        ? `June ${base.graduationYear}`
        : "—",
      gpa: gpaLabel,
      sat: "—",
      act: "—",
      toefl: "—",
      ielts: "—",
      duolingo: "—",
      intendedMajor: "—",
    },
    tennis: {
      utr: utrLabel,
      itfRanking: "—",
      nationalRanking: "—",
      ustaRanking: "—",
      preferredDivision: "—",
      playingStyle: "—",
      dominantHand,
      backhand,
      height: heightLabel,
    },
    videos: [],
    tournaments: [],
    documents: [],
    coachNotes: [],
    profileStrength: defaultProfileStrength,
    profileImageUrl: row.profile_image_url,
  };
}

/**
 * Fetch all players for college recruiting search.
 * UI must not call Supabase directly — use this helper.
 */
export async function getPlayers(): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select(PLAYER_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as PlayerRow[] | null) ?? []).map(mapRowToPlayer);
}

/**
 * Fetch a single player profile by id for college view.
 */
export async function getPlayer(id: string): Promise<PlayerDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select(PLAYER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapRowToPlayerDetail(data as PlayerRow);
}

/**
 * Resolve players by ids (saved list, dashboard, etc.).
 */
export async function getPlayersByIds(ids: string[]): Promise<Player[]> {
  if (ids.length === 0) return [];

  const uniqueIds = [...new Set(ids)];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select(PLAYER_SELECT)
    .in("id", uniqueIds);

  if (error) {
    throw new Error(error.message);
  }

  const byId = new Map(
    ((data as PlayerRow[] | null) ?? []).map((row) => [
      row.id,
      mapRowToPlayer(row),
    ]),
  );

  return uniqueIds
    .map((id) => byId.get(id))
    .filter((player): player is Player => Boolean(player));
}
