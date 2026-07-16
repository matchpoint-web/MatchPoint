/**
 * @deprecated Prefer `@/lib/college-profile`.
 * Thin compatibility aliases for older imports.
 */
export {
  COLLEGE_PROFILE_STORAGE_KEY as COLLEGE_SETTINGS_STORAGE_KEY,
  getCollegeProfile as getCollegeSettings,
  getDefaultCollegeProfile,
  getUniversityInitials,
  ncaaDivisions,
  saveCollegeProfile as saveCollegeSettings,
  type CollegeProfile as CollegeSettings,
  type NcaaDivision,
} from "@/lib/college-profile";
