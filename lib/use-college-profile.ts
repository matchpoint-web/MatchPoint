"use client";

import { useEffect, useState } from "react";
import {
  COLLEGE_PROFILE_STORAGE_KEY,
  COLLEGE_PROFILE_UPDATED_EVENT,
  getCollegeProfile,
  getDefaultCollegeProfile,
  type CollegeProfile,
} from "@/lib/college-profile";

/**
 * Shared client hook for college portal profile data.
 * Components should not call storage APIs directly.
 *
 * Initial render always uses the stable default profile so SSR and the
 * first client render match. localStorage is applied only after mount.
 */
export function useCollegeProfile(): CollegeProfile {
  const [profile, setProfile] = useState<CollegeProfile>(() =>
    getDefaultCollegeProfile(),
  );

  useEffect(() => {
    setProfile(getCollegeProfile());

    function handleUpdate(event: Event) {
      const custom = event as CustomEvent<CollegeProfile>;
      if (custom.detail) {
        setProfile(custom.detail);
        return;
      }
      setProfile(getCollegeProfile());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === null || event.key === COLLEGE_PROFILE_STORAGE_KEY) {
        setProfile(getCollegeProfile());
      }
    }

    window.addEventListener(COLLEGE_PROFILE_UPDATED_EVENT, handleUpdate);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener(COLLEGE_PROFILE_UPDATED_EVENT, handleUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return profile;
}
