import { notFound } from "next/navigation";
import { getSingleTeamData } from "@/features/campus/actions/campusActions";
import { TeamDetailView } from "@/features/campus/components/TeamDetailView";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params;
  const data = await getSingleTeamData(id);

  if (!data || !data.team) {
    notFound();
  }

  const { team, campus, leader, members } = data;

  return (
    <TeamDetailView
      team={team}
      campus={campus}
      leader={leader}
      members={members}
    />
  );
}
