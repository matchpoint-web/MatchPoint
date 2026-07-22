import {
  ageFromDateOfBirth,
  mapPlayerSearchRowToPlayer,
} from "@/lib/players/mappers";
import type { Player } from "@/lib/players";
import type { PlayerSearchRow } from "@/lib/players/search-queries";

/**
 * College-facing player profile — only fields that exist on `players`
 * (plus derived age / flag / initials). No mock academics, rankings, or division.
 */
export type CollegePlayerProfile = Player & {
  age: number | null;
  graduationYearNumber: number | null;
  dominantHand: string | null;
};

export function mapRowToCollegePlayerProfile(
  row: PlayerSearchRow,
): CollegePlayerProfile {
  const base = mapPlayerSearchRowToPlayer(row);

  return {
    ...base,
    age: ageFromDateOfBirth(row.date_of_birth),
    graduationYearNumber: row.graduation_year,
    dominantHand: base.handedness,
  };
}
