import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/auth/types";

/**
 * Portal role from immutable JWT app_metadata.
 * Never read user_metadata.role (clients can change that).
 */
export function getUserRole(user: User | null | undefined): UserRole | null {
  const role = user?.app_metadata?.role;
  if (role === "player" || role === "college") {
    return role;
  }
  return null;
}

export function homeForRole(role: UserRole): string {
  return role === "college" ? "/college/dashboard" : "/player";
}

export function loginPathForRole(role: UserRole): string {
  return role === "college" ? "/auth/college/login" : "/auth/player/login";
}

export function signupPathForRole(role: UserRole): string {
  return role === "college" ? "/auth/college/signup" : "/auth/player/signup";
}
