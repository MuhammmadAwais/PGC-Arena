import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function getSingleCampusData(campusId) {
  const [campusRes, directUsersRes, teamsRes] = await Promise.all([
    supabaseAdmin
      .from("campuses")
      .select("id, name, region, logo_url, banner_url, created_at")
      .eq("id", campusId)
      .maybeSingle(),
    supabaseAdmin
      .from("users")
      .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
      .eq("campus_id", campusId),
    supabaseAdmin
      .from("teams")
      .select("id, name, campus_id, leader_id, elo_rating, logo_url, banner_url, leader:users!leader_id(id, full_name, ign, avatar_url, roll_number)")
      .eq("campus_id", campusId),
  ]);

  const campus = campusRes.data;
  if (campusRes.error || !campus) {
    console.error("Campus Error:", campusRes.error);
    return null;
  }

  const teams = teamsRes.data || [];
  const teamIds = teams.map((t) => t.id);
  const teamIdSet = new Set(teamIds);

  let squadUsers = [];
  if (teamIds.length > 0) {
    const { data: su } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
      .in("team_id", teamIds);
    squadUsers = su || [];
  }

  const userMap = new Map();
  for (const u of directUsersRes.data || []) {
    userMap.set(u.id, u);
  }
  for (const u of squadUsers) {
    if (!userMap.has(u.id)) {
      userMap.set(u.id, u);
    }
  }

  const allUsers = Array.from(userMap.values());
  const manager = allUsers.find((u) => u.role === "CAMPUS_MANAGER") || null;
  const teachers = allUsers.filter((u) => u.role === "TEACHER");
  const directStudents = allUsers.filter((u) => u.role === "STUDENT");

  const populatedTeams = teams.map((team) => {
    const squadPlayers = directStudents.filter((m) => m.team_id === team.id);
    return {
      ...team,
      members: squadPlayers.map((m) => ({
        ...m,
        email: `${m.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        is_team_leader: team.leader_id === m.id,
      })),
      member_count: squadPlayers.length,
    };
  });

  const studentMap = new Map();
  for (const s of directStudents) {
    const teamObj = teams.find((t) => t.id === s.team_id);
    studentMap.set(s.id, {
      ...s,
      email: `${s.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
      team_name: teamObj?.name || undefined,
      is_team_leader: s.team_id && teamIdSet.has(s.team_id)
        ? teamObj?.leader_id === s.id
        : false,
    });
  }

  return {
    campus,
    manager,
    teachers,
    teams: populatedTeams,
    students: Array.from(studentMap.values()),
  };
}

async function run() {
  const result = await getSingleCampusData("bda67ebb-be51-432d-af0f-b27077beb847");
  console.log("Campus:", result?.campus.name);
  console.log("Students Count:", result?.students.length);
  console.log("Students:", result?.students);
  console.log("Teams Count:", result?.teams.length);
  console.log("Teams:", result?.teams.map(t => ({ name: t.name, member_count: t.member_count })));
}

run();
