export type RecruitingStatus =
  | "Interested"
  | "Contacted"
  | "Offer Sent"
  | "Committed"
  | "Archived";

export const recruitingStatuses: RecruitingStatus[] = [
  "Interested",
  "Contacted",
  "Offer Sent",
  "Committed",
  "Archived",
];

export type CoachCRMData = {
  rating: number;
  status: RecruitingStatus;
  followUpDate: string;
  reminderEnabled: boolean;
  privateNotes: string;
  playerName?: string;
};

export type CoachReminder = {
  playerId: string;
  playerName: string;
  followUpDate: string;
  reminderEnabled: boolean;
};

const STORAGE_KEY = "matchpoint-coach-crm";

function readAll(): Record<string, CoachCRMData> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CoachCRMData>) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, CoachCRMData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCoachCRMData(
  playerId: string,
  defaults?: Partial<CoachCRMData>,
): CoachCRMData {
  const stored = readAll()[playerId];
  const base: CoachCRMData = {
    rating: 5,
    status: "Interested",
    followUpDate: "",
    reminderEnabled: false,
    privateNotes: "",
  };

  return {
    ...base,
    ...defaults,
    ...stored,
  };
}

export function saveCoachCRMData(
  playerId: string,
  data: CoachCRMData,
  playerName?: string,
) {
  const all = readAll();
  all[playerId] = { ...data, playerName: playerName ?? data.playerName };
  writeAll(all);
}

export function getDueReminders(today = new Date()): CoachReminder[] {
  const all = readAll();
  const todayStr = today.toISOString().slice(0, 10);
  const reminders: CoachReminder[] = [];

  for (const [playerId, data] of Object.entries(all)) {
    if (
      data.reminderEnabled &&
      data.followUpDate &&
      data.followUpDate <= todayStr
    ) {
      reminders.push({
        playerId,
        playerName: data.playerName ?? playerId,
        followUpDate: data.followUpDate,
        reminderEnabled: data.reminderEnabled,
      });
    }
  }

  return reminders;
}

export function getReminderMessage(playerName: string): string {
  return `Follow up with ${playerName} today.`;
}
