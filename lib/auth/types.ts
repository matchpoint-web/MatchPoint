export type UserRole = "player" | "college";

export type AuthActionState = {
  error: string | null;
  success?: string | null;
};

export const INITIAL_AUTH_STATE: AuthActionState = {
  error: null,
  success: null,
};
