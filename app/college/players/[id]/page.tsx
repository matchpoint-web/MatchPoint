import { notFound } from "next/navigation";
import { CollegeProfileView } from "@/components/college/players/profile/CollegeProfileView";
import {
  getAllCollegePlayerIds,
  getCollegePlayerProfile,
} from "@/lib/college-player-profile";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollegePlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const profile = getCollegePlayerProfile(id);

  if (!profile) {
    notFound();
  }

  return <CollegeProfileView profile={profile} />;
}

export async function generateStaticParams() {
  return getAllCollegePlayerIds().map((id) => ({ id }));
}
