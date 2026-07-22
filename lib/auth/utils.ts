import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/auth/types";

/**
 * Portal role from immutable JWT app_metadata.
 * Never read user_metadata.role (clients can change that).
 * Admin is never self-assigned via signup — only service-role app_metadata.
 */
export function getUserRole(user: User | null | undefined): UserRole | null {
  const role = user?.app_metadata?.role;
  if (role === "player" || role === "college" || role === "admin") {
    return role;
  }
  return null;
}

export function homeForRole(role: UserRole): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "college") return "/college/dashboard";
  return "/player";
}

export function loginPathForRole(role: UserRole): string {
  if (role === "admin") return "/auth/admin/login";
  if (role === "college") return "/auth/college/login";
  return "/auth/player/login";
}

export function signupPathForRole(role: Exclude<UserRole, "admin">): string {
  return role === "college" ? "/auth/college/signup" : "/auth/player/signup";
}
