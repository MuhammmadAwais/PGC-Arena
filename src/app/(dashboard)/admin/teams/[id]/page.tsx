import { notFound } from "next/navigation";
import {
  getSingleTeamData,
  getAssignableDataAction,
} from "@/features/campus/actions/campusActions";
import { TeamDetailView } from "@/features/campus/components/TeamDetailView";

interface TeamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailPage({ params }: TeamDetailPageProps) {
  const { id } = await params;
  const [data, assignables] = await Promise.all([
    getSingleTeamData(id),
    getAssignableDataAction(),
  ]);

  if (!data || !data.team) {
    notFound();
  }

  const { team, campus, leader, members } = data;

  // Filter candidate students for drafting/assigning to this squad
  const allCandidateStudents = assignables.users
    .filter((u) => u.role === "STUDENT")
    .map((u) => {
      const uCampus = assignables.campuses.find((c) => c.id === u.campus_id);
      const uTeam = assignables.teams.find((t) => t.id === u.team_id);
      return {
        ...u,
        campus_name: uCampus?.name,
        team_name: uTeam?.name,
      };
    });

  return (
    <TeamDetailView
      team={team}
      campus={campus}
      leader={leader}
      members={members}
      allCampuses={assignables.campuses}
      allCandidateStudents={allCandidateStudents}
      allTeams={assignables.teams}
    />
  );
}
