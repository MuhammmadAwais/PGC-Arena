import { notFound } from "next/navigation";
import {
  getSingleCampusData,
  getAssignableDataAction,
} from "@/features/campus/actions/campusActions";
import { CampusDetailView } from "@/features/campus/components/CampusDetailView";

interface CampusDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampusDetailPage({ params }: CampusDetailPageProps) {
  const { id } = await params;
  const [data, assignables] = await Promise.all([
    getSingleCampusData(id),
    getAssignableDataAction(),
  ]);

  if (!data || !data.campus) {
    notFound();
  }

  const { campus, manager, teachers, teams, students } = data;

  // Filter available managers (users with role CAMPUS_MANAGER or TEACHER)
  const availableManagers = assignables.users.filter(
    (u) => u.role === "CAMPUS_MANAGER" || u.role === "TEACHER"
  );

  // Filter candidate students for drafting/assigning
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
    <CampusDetailView
      campus={campus}
      manager={manager}
      teachers={teachers}
      teams={teams}
      students={students}
      allManagers={availableManagers}
      allCandidateStudents={allCandidateStudents}
      allCampuses={assignables.campuses}
      allTeams={assignables.teams}
    />
  );
}
