/**
 * @deprecated Prefer `@/lib/college-profile` types and
 * `@/lib/college-profile-service` for persistence.
 */
export {
  type CollegeProfile as CollegeSettings,
  getDefaultCollegeProfile as getCollegeSettings,
  getUniversityInitials,
  ncaaDivisions,
  type NcaaDivision,
} from "@/lib/college-profile";
