import type { Tables } from "@/lib/database.types";
import {
  filterOptions,
  PLAYERS_PER_PAGE,
  type PlayerFilters,
  type SortOption,
} from "@/lib/players";
import { createClient } from "@/lib/supabase/server";

/** Columns needed to map a search/list card. */
export const PLAYER_SEARCH_SELECT =
  "id, full_name, nationality, graduation_year, utr, gpa, height, weight, dominant_hand, backhand, date_of_birth, bio, profile_image_url, created_at, user_id" as const;

export type PlayerSearchRow = Pick<
  Tables<"players">,
  | "id"
  | "full_name"
  | "nationality"
  | "graduation_year"
  | "utr"
  | "gpa"
  | "height"
  | "weight"
  | "dominant_hand"
  | "backhand"
  | "date_of_birth"
  | "bio"
  | "profile_image_url"
  | "created_at"
  | "user_id"
>;

export type PlayerSearchQueryInput = {
  query: string;
  filters: PlayerFilters;
  sort: SortOption;
  page: number;
  pageSize?: number;
};

export type PlayerSearchQueryResult = {
  rows: PlayerSearchRow[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const listedCountries = filterOptions.countries.filter((c) => c !== "Other");
const listedGradYears = filterOptions.graduationYears
  .filter((y) => y !== "Other")
  .map((y) => Number(y))
  .filter((n) => Number.isFinite(n));

/** Escape `%` / `_` for safe ILIKE patterns. */
function escapeIlike(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function parseUtrBounds(
  range: string,
): { min: number; max: number | null } | null {
  const ranges: Record<string, { min: number; max: number | null }> = {
    "6-7": { min: 6, max: 7 },
    "7-8": { min: 7, max: 8 },
    "8-9": { min: 8, max: 9 },
    "9-10": { min: 9, max: 10 },
    "10-11": { min: 10, max: 11 },
    "11-12": { min: 11, max: 12 },
    "12-13": { min: 12, max: 13 },
    "13-14": { min: 13, max: 14 },
    "14+": { min: 14, max: null },
  };
  return ranges[range] ?? null;
}

function parseGpaBounds(
  range: string,
): { min: number | null; max: number | null; maxInclusive: boolean } | null {
  switch (range) {
    case "below-2":
      return { min: null, max: 2, maxInclusive: false };
    case "2-2.5":
      return { min: 2, max: 2.5, maxInclusive: false };
    case "2.5-3":
      return { min: 2.5, max: 3, maxInclusive: false };
    case "3-3.5":
      return { min: 3, max: 3.5, maxInclusive: false };
    case "3.5-4":
      return { min: 3.5, max: 4, maxInclusive: true };
    default:
      return null;
  }
}

function parseHeightBounds(
  range: string,
): { min: number | null; max: number | null; maxInclusive: boolean } | null {
  switch (range) {
    case "under-150":
      return { min: null, max: 150, maxInclusive: false };
    case "150-160":
      return { min: 150, max: 160, maxInclusive: false };
    case "160-170":
      return { min: 160, max: 170, maxInclusive: false };
    case "170-180":
      return { min: 170, max: 180, maxInclusive: false };
    case "180-190":
      return { min: 180, max: 190, maxInclusive: false };
    case "190-200":
      return { min: 190, max: 200, maxInclusive: false };
    case "200+":
      return { min: 200, max: null, maxInclusive: false };
    default:
      return null;
  }
}

function quoteList(values: string[]): string {
  return values.map((v) => `"${v.replace(/"/g, '\\"')}"`).join(",");
}

/**
 * Query authenticated players with DB-side filters, sort, and pagination.
 */
export async function queryPlayersPage(
  input: PlayerSearchQueryInput,
): Promise<PlayerSearchQueryResult> {
  const pageSize =
    input.pageSize && input.pageSize > 0 ? input.pageSize : PLAYERS_PER_PAGE;
  const page = Math.max(1, Math.floor(input.page) || 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = await createClient();
  const { filters } = input;

  let query = supabase
    .from("players")
    .select(PLAYER_SEARCH_SELECT, { count: "exact" })
    // Only players linked to authenticated accounts
    .not("user_id", "is", null)
    // Colleges must not see suspended accounts
    .eq("account_status", "ACTIVE");

  const nameQuery = input.query.trim();
  if (nameQuery) {
    query = query.ilike("full_name", `%${escapeIlike(nameQuery)}%`);
  }

  if (filters.country) {
    if (filters.country === "Other") {
      query = query.or(
        `nationality.is.null,nationality.not.in.(${quoteList(listedCountries)})`,
      );
    } else {
      query = query.eq("nationality", filters.country);
    }
  }

  if (filters.graduationYear) {
    if (filters.graduationYear === "Other") {
      query = query.or(
        `graduation_year.is.null,graduation_year.not.in.(${listedGradYears.join(",")})`,
      );
    } else {
      const year = Number(filters.graduationYear);
      if (Number.isFinite(year)) {
        query = query.eq("graduation_year", year);
      }
    }
  }

  const utrBounds = parseUtrBounds(filters.utrRange);
  if (utrBounds) {
    query = query.gte("utr", utrBounds.min);
    if (utrBounds.max != null) {
      query = query.lt("utr", utrBounds.max);
    }
  }

  const gpaBounds = parseGpaBounds(filters.gpaRange);
  if (gpaBounds) {
    if (gpaBounds.min != null) {
      query = query.gte("gpa", gpaBounds.min);
    }
    if (gpaBounds.max != null) {
      query = gpaBounds.maxInclusive
        ? query.lte("gpa", gpaBounds.max)
        : query.lt("gpa", gpaBounds.max);
    }
  }

  if (filters.handedness === "Right" || filters.handedness === "Left") {
    query = query.eq("dominant_hand", filters.handedness);
  }

  const heightBounds = parseHeightBounds(filters.heightRange);
  if (heightBounds) {
    if (heightBounds.min != null) {
      query = query.gte("height", heightBounds.min);
    }
    if (heightBounds.max != null) {
      query = heightBounds.maxInclusive
        ? query.lte("height", heightBounds.max)
        : query.lt("height", heightBounds.max);
    }
  }

  // division / major / academicTest: no matching columns on `players` yet

  switch (input.sort) {
    case "highest-gpa":
      query = query.order("gpa", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "highest-utr":
    default:
      query = query.order("utr", { ascending: false, nullsFirst: false });
      break;
  }

  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data as PlayerSearchRow[] | null) ?? [],
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}
