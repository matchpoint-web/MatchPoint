import { createClient } from "@/lib/supabase/server";
import {
  type College,
  type CollegeDivision,
} from "@/lib/colleges";
import { isNcaaDivision } from "@/lib/college-profile";
import { type CollegeRow } from "@/lib/college-profile-service";

const COLLEGE_SEARCH_SELECT =
  "id, user_id, school_name, division, location, conference, state, city, website, head_coach, assistant_coach, contact_email, about_program, facilities, recruiting_information, logo_url, created_at, updated_at";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

function mapDivision(value: string | null | undefined): CollegeDivision {
  if (value && isNcaaDivision(value)) return value;
  return "NCAA D1";
}

function mapRowToCollege(row: CollegeRow): College {
  const name = row.school_name?.trim() || "Unnamed College";
  const city =
    row.city?.trim() ||
    (row.location?.includes(",")
      ? row.location.split(",")[0]!.trim()
      : row.location?.trim()) ||
    "";
  const state =
    row.state?.trim() ||
    (row.location?.includes(",")
      ? row.location.split(",").slice(-1)[0]!.trim()
      : "") ||
    "";

  return {
    id: row.id,
    name,
    initials: initialsFromName(name),
    division: mapDivision(row.division),
    conference: row.conference?.trim() || null,
    state,
    city,
    // Not stored on colleges yet — omit from cards when null.
    academicRanking: null,
    averageTeamUtr: null,
    rosterSize: null,
    internationalPlayers: null,
    costOfAttendance: null,
    coach: row.head_coach?.trim() || "",
    website: row.website?.trim() || "",
    about: row.about_program?.trim() || "",
    facilities: row.facilities?.trim() || "",
    contact: row.contact_email?.trim() || "",
    logoUrl: row.logo_url,
  };
}

/** All colleges visible to the current player (for search). */
export async function getColleges(): Promise<College[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select(COLLEGE_SEARCH_SELECT)
    .order("school_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data as CollegeRow[] | null) ?? []).map(mapRowToCollege);
}

/** Single college by id for the detail page. */
export async function getCollegeById(id: string): Promise<College | null> {
  if (!id) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("colleges")
    .select(COLLEGE_SEARCH_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapRowToCollege(data as CollegeRow);
}
