import { notFound } from "next/navigation";
import { getSingleCampusData } from "@/features/campus/actions/campusActions";
import { CampusDetailView } from "@/features/campus/components/CampusDetailView";

interface CampusDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampusDetailPage({ params }: CampusDetailPageProps) {
  const { id } = await params;
  const data = await getSingleCampusData(id);

  if (!data || !data.campus) {
    notFound();
  }

  const { campus, manager, teachers, teams, students } = data;

  return (
    <CampusDetailView
      campus={campus}
      manager={manager}
      teachers={teachers}
      teams={teams}
      students={students}
    />
  );
}
