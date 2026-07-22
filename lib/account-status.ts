/** Shared account-status vocabulary for players and colleges. */

export type PlayerAccountStatus = "ACTIVE" | "SUSPENDED";

export type CollegeAccountStatus = "PENDING" | "APPROVED" | "SUSPENDED";

export const SUSPENDED_REASONS = [
  "SPAM",
  "FAKE_ACCOUNT",
  "FAKE_UNIVERSITY",
  "ABUSE",
  "TERMS_VIOLATION",
  "OTHER",
] as const;

export type SuspendedReason = (typeof SUSPENDED_REASONS)[number];

export function isPlayerAccountStatus(
  value: string,
): value is PlayerAccountStatus {
  return value === "ACTIVE" || value === "SUSPENDED";
}

export function isCollegeAccountStatus(
  value: string,
): value is CollegeAccountStatus {
  return value === "PENDING" || value === "APPROVED" || value === "SUSPENDED";
}

export function isSuspendedReason(value: string): value is SuspendedReason {
  return (SUSPENDED_REASONS as readonly string[]).includes(value);
}

export function formatAccountStatus(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING":
      return "Pending approval";
    case "APPROVED":
      return "Approved";
    case "SUSPENDED":
      return "Suspended";
    default:
      return status;
  }
}

export function formatSuspendedReason(reason: SuspendedReason): string {
  switch (reason) {
    case "SPAM":
      return "Spam";
    case "FAKE_ACCOUNT":
      return "Fake account";
    case "FAKE_UNIVERSITY":
      return "Fake university";
    case "ABUSE":
      return "Abuse";
    case "TERMS_VIOLATION":
      return "Terms violation";
    case "OTHER":
      return "Other";
    default:
      return reason;
  }
}
