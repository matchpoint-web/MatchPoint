"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState, UserRole } from "@/lib/auth/types";
import { homeForRole, loginPathForRole } from "@/lib/auth/utils";

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function signUp(
  role: UserRole,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const fullName = getString(formData, "full_name");
  const schoolName = getString(formData, "school_name");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  if (role === "player" && !fullName) {
    return { error: "Full name is required." };
  }

  if (role === "college" && !schoolName) {
    return { error: "School name is required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        ...(role === "player"
          ? { full_name: fullName }
          : { school_name: schoolName }),
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.session) {
    return {
      error: null,
      success:
        "Account created. Check your email to confirm, then log in.",
    };
  }

  redirect(homeForRole(role));
}

export async function signIn(
  role: UserRole,
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const next = getString(formData, "next");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const userRole = data.user?.user_metadata?.role;
  if (userRole && userRole !== role) {
    await supabase.auth.signOut();
    return {
      error: `This account is registered as a ${userRole}. Please use the ${userRole} login.`,
    };
  }

  if (next && next.startsWith("/")) {
    redirect(next);
  }

  redirect(homeForRole(role));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requireUser(role?: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(role ? loginPathForRole(role) : "/");
  }

  if (role) {
    const userRole = user.user_metadata?.role;
    if (userRole !== role) {
      redirect(userRole === "college" || userRole === "player"
        ? homeForRole(userRole)
        : loginPathForRole(role));
    }
  }

  return user;
}
