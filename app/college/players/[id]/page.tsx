import { notFound } from "next/navigation";
import { CollegeProfileView } from "@/components/college/players/profile/CollegeProfileView";
import { getCoachNote } from "@/lib/coach-notes-service";
import { getPlayer } from "@/lib/player-service";
import {
  getCurrentCollegeId,
  isPlayerSaved,
} from "@/lib/saved-player-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollegePlayerProfilePage({ params }: PageProps) {
  const { id } = await params;

  let profile;
  try {
    profile = await getPlayer(id);
  } catch {
    notFound();
  }

  if (!profile) {
    notFound();
  }

  let collegeId: string | null = null;
  let initiallySaved = false;
  let initialCoachNote = null;

  try {
    collegeId = await getCurrentCollegeId();
    if (collegeId) {
      const [saved, note] = await Promise.all([
        isPlayerSaved(collegeId, id),
        getCoachNote(id),
      ]);
      initiallySaved = saved;
      initialCoachNote = note;
    }
  } catch {
    collegeId = null;
    initiallySaved = false;
    initialCoachNote = null;
  }

  return (
    <CollegeProfileView
      profile={profile}
      collegeId={collegeId}
      initiallySaved={initiallySaved}
      initialCoachNote={initialCoachNote}
    />
  );
}
