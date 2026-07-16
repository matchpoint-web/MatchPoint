"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  COLLEGE_PROFILE_UPDATED_EVENT,
  getDefaultCollegeProfile,
  type CollegeProfile,
} from "@/lib/college-profile";

type CollegeProfileContextValue = {
  profile: CollegeProfile;
  setProfile: (profile: CollegeProfile) => void;
};

const CollegeProfileContext = createContext<CollegeProfileContextValue | null>(
  null,
);

type CollegeProfileProviderProps = {
  initialProfile: CollegeProfile;
  children: ReactNode;
};

export function CollegeProfileProvider({
  initialProfile,
  children,
}: CollegeProfileProviderProps) {
  const [profile, setProfileState] = useState<CollegeProfile>(initialProfile);

  useEffect(() => {
    setProfileState(initialProfile);
  }, [initialProfile]);

  const setProfile = useCallback((next: CollegeProfile) => {
    setProfileState(next);
  }, []);

  useEffect(() => {
    function handleUpdate(event: Event) {
      const custom = event as CustomEvent<CollegeProfile>;
      if (custom.detail) {
        setProfileState(custom.detail);
      }
    }

    window.addEventListener(COLLEGE_PROFILE_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(COLLEGE_PROFILE_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const value = useMemo(
    () => ({ profile, setProfile }),
    [profile, setProfile],
  );

  return (
    <CollegeProfileContext.Provider value={value}>
      {children}
    </CollegeProfileContext.Provider>
  );
}

/**
 * College portal profile from Supabase (via layout provider).
 * Outside the provider, returns empty defaults (e.g. player portal).
 */
export function useCollegeProfile(): CollegeProfile {
  const ctx = useContext(CollegeProfileContext);
  if (!ctx) {
    return getDefaultCollegeProfile();
  }
  return ctx.profile;
}

export function useCollegeProfileActions() {
  const ctx = useContext(CollegeProfileContext);
  return {
    setProfile: ctx?.setProfile ?? (() => undefined),
  };
}
