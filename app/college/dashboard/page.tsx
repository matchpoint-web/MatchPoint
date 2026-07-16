import { CollegeDashboardClient } from "@/components/college/dashboard/CollegeDashboardClient";
import { type CoachNote } from "@/lib/coach-notes";
import {
  countCoachNotesByStatus,
  getRecentCoachNotes,
} from "@/lib/coach-notes-service";
import { getPlayers } from "@/lib/player-service";
import {
  getCurrentCollegeId,
  getSavedPlayers,
  type SavedPlayerRecord,
} from "@/lib/saved-player-service";

export default async function CollegeDashboard() {
  let players: Awaited<ReturnType<typeof getPlayers>> = [];
  let savedRecords: SavedPlayerRecord[] = [];
  let coachNotes: CoachNote[] = [];
  let recruitingCount = 0;
  let followUpCount = 0;

  try {
    const [fetchedPlayers, collegeId] = await Promise.all([
      getPlayers(),
      getCurrentCollegeId(),
    ]);
    players = fetchedPlayers;

    if (collegeId) {
      const [saved, recentNotes, recruiting, followUp] = await Promise.all([
        getSavedPlayers(collegeId),
        getRecentCoachNotes(5),
        countCoachNotesByStatus("Recruiting"),
        countCoachNotesByStatus("Follow Up"),
      ]);
      savedRecords = saved;
      coachNotes = recentNotes;
      recruitingCount = recruiting;
      followUpCount = followUp;
    }
  } catch {
    players = [];
    savedRecords = [];
    coachNotes = [];
    recruitingCount = 0;
    followUpCount = 0;
  }

  return (
    <div className="px-6 py-8 sm:px-8 lg:px-10">
      <CollegeDashboardClient
        players={players}
        savedRecords={savedRecords}
        coachNotes={coachNotes}
        recruitingCount={recruitingCount}
        followUpCount={followUpCount}
      />
    </div>
  );
}
