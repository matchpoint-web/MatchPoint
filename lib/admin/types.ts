import type {
  CollegeAccountStatus,
  PlayerAccountStatus,
  SuspendedReason,
} from "@/lib/account-status";

export type AdminDashboardStats = {
  activePlayers: number;
  suspendedPlayers: number;
  pendingColleges: number;
  approvedColleges: number;
  suspendedColleges: number;
};

export type SuspensionMetadata = {
  suspendedReason: SuspendedReason | null;
  suspendedAt: string | null;
  suspendedBy: string | null;
};

export type AdminPlayerListItem = {
  id: string;
  userId: string | null;
  fullName: string;
  nationality: string | null;
  graduationYear: number | null;
  utr: number | null;
  accountStatus: PlayerAccountStatus;
  createdAt: string;
};

export type AdminPlayerDetail = AdminPlayerListItem &
  SuspensionMetadata & {
    gpa: number | null;
    height: number | null;
    weight: number | null;
    dominantHand: string | null;
    backhand: string | null;
    dateOfBirth: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    updatedAt: string;
  };

export type AdminCollegeListItem = {
  id: string;
  userId: string | null;
  schoolName: string;
  division: string | null;
  location: string | null;
  state: string | null;
  city: string | null;
  contactEmail: string | null;
  headCoach: string | null;
  accountStatus: CollegeAccountStatus;
  createdAt: string;
};

export type AdminCollegeDetail = AdminCollegeListItem &
  SuspensionMetadata & {
    conference: string | null;
    website: string | null;
    assistantCoach: string | null;
    aboutProgram: string | null;
    facilities: string | null;
    recruitingInformation: string | null;
    logoUrl: string | null;
    updatedAt: string;
  };

export type AdminActionResult = {
  error: string | null;
  success: string | null;
};
