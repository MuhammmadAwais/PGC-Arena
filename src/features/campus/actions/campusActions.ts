"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CampusItem, MemberItem, TeamItem, UserRole } from "../types/campusTypes";

// ── Validation Schemas ───────────────────────────────────────────

const createCampusSchema = z.object({
  name: z.string().min(3, "Campus name must be at least 3 characters"),
  region: z.string().optional(),
});

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  campus_id: z.string().uuid("Invalid Campus ID"),
  leader_id: z.string().uuid("Invalid Leader ID").optional().nullable(),
  elo_rating: z.coerce.number().optional().default(1000),
});

const addMemberSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER", "STUDENT"]),
  roll_number: z.string().min(6, "Roll Number / Employee ID must be at least 6 characters"),
  campus_id: z.string().uuid().optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
  ign: z.string().min(6, "In-Game Name (IGN) must be at least 6 characters").optional().nullable().or(z.literal("")),
  is_captain: z.boolean().optional().default(false),
});

// ── Server Actions ───────────────────────────────────────────────

/**
 * Fetch all campuses, teams, and users dynamically from Supabase
 * and construct the hierarchical structure and flat directory.
 */
export async function getCampusesData(): Promise<{
  success: boolean;
  campuses: CampusItem[];
  allMembers: MemberItem[];
  allTeams: TeamItem[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Fetch campuses
    const { data: campusesRaw, error: campusError } = await supabase
      .from("campuses")
      .select("id, name, logo_url, banner_url, region, created_at")
      .order("name", { ascending: true });

    if (campusError) throw campusError;

    // 2. Fetch teams
    const { data: teamsRaw, error: teamError } = await supabase
      .from("teams")
      .select("id, name, campus_id, leader_id, logo_url, banner_url, elo_rating, created_at")
      .order("name", { ascending: true });

    if (teamError) throw teamError;

    // 3. Fetch users
    const { data: usersRaw, error: userError } = await supabase
      .from("users")
      .select("id, full_name, role, roll_number, campus_id, team_id, ign, avatar_url, is_first_login");

    if (userError) throw userError;

    // 4. Fetch emails via supabaseAdmin if available for complete directory view
    let emailsMap = new Map<string, string>();
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          if (u.email) emailsMap.set(u.id, u.email);
        }
      }
    } catch {
      // Gracefully fall back if auth listing is restricted
    }

    // Index maps
    const campusMap = new Map((campusesRaw || []).map((c) => [c.id, c.name]));
    const campusLogoMap = new Map((campusesRaw || []).map((c) => [c.id, c.logo_url]));
    const teamMap = new Map((teamsRaw || []).map((t) => [t.id, t]));

    // Construct flat members list with dynamic is_team_leader derivation
    const allMembers: MemberItem[] = (usersRaw || []).map((u) => {
      const team = u.team_id ? teamMap.get(u.team_id) : undefined;
      const isLeader = team ? team.leader_id === u.id : false;

      return {
        id: u.id,
        full_name: u.full_name,
        email: emailsMap.get(u.id) || `${u.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        role: u.role as UserRole,
        roll_number: u.roll_number,
        campus_id: u.campus_id,
        campus_name: u.campus_id ? campusMap.get(u.campus_id) || "Unknown Campus" : "Global / Head Office",
        campus_logo_url: u.campus_id ? campusLogoMap.get(u.campus_id) || null : null,
        team_id: u.team_id,
        team_name: team ? team.name : undefined,
        team_logo_url: team ? team.logo_url : undefined,
        ign: u.ign,
        elo_rating: team ? (team.elo_rating ?? 1000) : 1000,
        is_team_leader: isLeader,
        avatar_url: u.avatar_url,
        status: "Active",
        academic_program: u.role === "STUDENT" ? "ICS / Computer Science" : undefined,
      };
    });

    const membersById = new Map(allMembers.map((m) => [m.id, m]));

    // Construct all teams with member rosters and leader details
    const allTeams: TeamItem[] = (teamsRaw || []).map((t) => {
      const members = allMembers.filter((m) => m.team_id === t.id);
      const leader = t.leader_id ? membersById.get(t.leader_id) || null : null;

      return {
        id: t.id,
        name: t.name,
        campus_id: t.campus_id,
        campus_name: campusMap.get(t.campus_id) || "Unknown Campus",
        campus_logo_url: campusLogoMap.get(t.campus_id) || null,
        leader_id: t.leader_id,
        leader: leader,
        logo_url: t.logo_url,
        banner_url: t.banner_url,
        elo_rating: t.elo_rating ?? 1000,
        status: "Active",
        member_count: members.length,
        members: members,
        created_at: t.created_at,
      };
    });

    // Construct hierarchical Campuses list
    const campuses: CampusItem[] = (campusesRaw || []).map((c) => {
      const campusTeams = allTeams.filter((t) => t.campus_id === c.id);
      const campusMembers = allMembers.filter((m) => m.campus_id === c.id);
      const managerMember = campusMembers.find((m) => m.role === "CAMPUS_MANAGER");
      const teachers = campusMembers.filter((m) => m.role === "TEACHER");
      const students = campusMembers.filter((m) => m.role === "STUDENT");

      // Extract region from name if format is "PGC Alpha Campus (Lahore Central)"
      const regionMatch = c.name.match(/\((.*?)\)/);
      const region = c.region || (regionMatch ? regionMatch[1] : "Punjab");

      return {
        id: c.id,
        name: c.name,
        region: region,
        logo_url: c.logo_url,
        banner_url: c.banner_url,
        manager: managerMember
          ? {
              id: managerMember.id,
              full_name: managerMember.full_name,
              email: managerMember.email,
              roll_number: managerMember.roll_number,
              avatar_url: managerMember.avatar_url,
            }
          : null,
        teachersCount: teachers.length,
        activeTeamsCount: campusTeams.length,
        totalStudentsCount: students.length,
        status: "Active",
        isStarred: false,
        teams: campusTeams,
        teachers: teachers,
        students: students,
      };
    });

    return {
      success: true,
      campuses,
      allMembers,
      allTeams,
    };
  } catch (error: any) {
    console.error("Error fetching campus data:", error);
    return {
      success: false,
      campuses: [],
      allMembers: [],
      allTeams: [],
      error: error.message || "Failed to load campus data",
    };
  }
}

/**
 * Server Action: Create a new Campus
 */
export async function createCampusAction(data: { name: string; region?: string }) {
  const result = createCampusSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const formattedName = data.region && !data.name.includes("(") 
      ? `${data.name} (${data.region})` 
      : data.name;

    const { data: newCampus, error } = await supabaseAdmin
      .from("campuses")
      .insert({ name: formattedName })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/campuses");
    return { success: true, campus: newCampus, message: `Campus "${newCampus.name}" created successfully!` };
  } catch (error: any) {
    console.error("Create Campus Error:", error);
    return { error: error.message || "Failed to create campus." };
  }
}

/**
 * Server Action: Create a new Team with optional Team Leader assignment
 */
export async function createTeamAction(data: {
  name: string;
  campus_id: string;
  leader_id?: string | null;
  elo_rating?: number;
}) {
  const result = createTeamSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const { data: newTeam, error } = await supabaseAdmin
      .from("teams")
      .insert({
        name: data.name,
        campus_id: data.campus_id,
        leader_id: data.leader_id || null,
        elo_rating: data.elo_rating ?? 1000,
      })
      .select()
      .single();

    if (error) throw error;

    // If leader_id was assigned, update the leader's team_id
    if (data.leader_id) {
      await supabaseAdmin
        .from("users")
        .update({ team_id: newTeam.id })
        .eq("id", data.leader_id);
    }

    revalidatePath("/admin/campuses");
    return { success: true, team: newTeam, message: `Team "${newTeam.name}" created successfully!` };
  } catch (error: any) {
    console.error("Create Team Error:", error);
    return { error: error.message || "Failed to create team." };
  }
}

/**
 * Server Action: Add a new Member (Student, Teacher, Manager)
 */
export async function addMemberAction(data: {
  full_name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "CAMPUS_MANAGER" | "TEACHER" | "STUDENT";
  roll_number: string;
  campus_id?: string | null;
  team_id?: string | null;
  ign?: string | null;
  is_captain?: boolean;
}) {
  const result = addMemberSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { full_name, email, password, role, roll_number, campus_id, team_id, ign, is_captain } = result.data;

  try {
    // 1. Create Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (authError || !authData.user) {
      return { error: authError?.message || "Failed to create user authentication." };
    }

    const userId = authData.user.id;

    // 2. Insert into public.users table
    const { error: dbError } = await supabaseAdmin.from("users").insert({
      id: userId,
      full_name,
      role,
      roll_number,
      campus_id: campus_id || null,
      team_id: team_id || null,
      ign: ign || null,
      is_first_login: false,
    });

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: dbError.message || "Failed to create user profile." };
    }

    // 3. If marked as captain and team_id exists, assign leader_id on the team
    if (is_captain && team_id) {
      await supabaseAdmin
        .from("teams")
        .update({ leader_id: userId })
        .eq("id", team_id);
    }

    revalidatePath("/admin/campuses");
    return { success: true, message: `${full_name} has been added successfully.` };
  } catch (error: any) {
    console.error("Add Member Error:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Server Action: Assign Team Captain / Leader
 */
export async function assignTeamLeaderAction(teamId: string, studentId: string | null) {
  try {
    const { error } = await supabaseAdmin
      .from("teams")
      .update({ leader_id: studentId })
      .eq("id", teamId);

    if (error) throw error;

    if (studentId) {
      await supabaseAdmin
        .from("users")
        .update({ team_id: teamId })
        .eq("id", studentId);
    }

    revalidatePath("/admin/campuses");
    return { success: true, message: "Team captain updated successfully." };
  } catch (error: any) {
    console.error("Assign Captain Error:", error);
    return { error: error.message || "Failed to update team captain." };
  }
}

/**
 * Real-time Validation Action: Check if an IGN (In-Game Name) is already taken
 */
export async function checkIgnAvailabilityAction(
  ign: string
): Promise<{ available: boolean; takenBy?: string; tooShort?: boolean }> {
  try {
    const trimmed = ign.trim();
    if (!trimmed) {
      return { available: false, tooShort: true };
    }
    if (trimmed.length < 6) {
      return { available: false, tooShort: true };
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, ign")
      .ilike("ign", trimmed)
      .maybeSingle();

    if (error) {
      console.error("Check IGN Error:", error);
      return { available: true };
    }

    if (data) {
      return { available: false, takenBy: data.full_name };
    }

    return { available: true };
  } catch (err) {
    console.error("Check IGN Exception:", err);
    return { available: true };
  }
}

/**
 * Real-time Validation Action: Check if a Roll Number / Employee ID is already registered
 */
export async function checkRollNumberAvailabilityAction(
  rollNumber: string
): Promise<{ available: boolean; takenBy?: string; tooShort?: boolean }> {
  try {
    const trimmed = rollNumber.trim();
    if (!trimmed) {
      return { available: false, tooShort: true };
    }
    if (trimmed.length < 6) {
      return { available: false, tooShort: true };
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .select("id, full_name, roll_number")
      .ilike("roll_number", trimmed)
      .maybeSingle();

    if (error) {
      console.error("Check Roll Number Error:", error);
      return { available: true };
    }

    if (data) {
      return { available: false, takenBy: data.full_name };
    }

    return { available: true };
  } catch (err) {
    console.error("Check Roll Number Exception:", err);
    return { available: true };
  }
}

/**
 * Server Action: Permanently Delete a Campus
 */
export async function deleteCampusAction(
  campusId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!campusId) {
      return { error: "Campus ID is required." };
    }

    // 1. Delete the campus record (cascades or cleans up associations)
    const { error } = await supabaseAdmin
      .from("campuses")
      .delete()
      .eq("id", campusId);

    if (error) throw error;

    revalidatePath("/admin/campuses");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Campus Error:", err);
    return { error: err.message || "Failed to delete campus." };
  }
}

/**
 * Server Action: Permanently Delete an Esports Team
 */
export async function deleteTeamAction(
  teamId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!teamId) {
      return { error: "Team ID is required." };
    }

    // 1. Unassign all members from this team
    await supabaseAdmin
      .from("users")
      .update({ team_id: null })
      .eq("team_id", teamId);

    // 2. Delete the team record
    const { error } = await supabaseAdmin
      .from("teams")
      .delete()
      .eq("id", teamId);

    if (error) throw error;

    revalidatePath("/admin/campuses");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Team Error:", err);
    return { error: err.message || "Failed to delete team." };
  }
}

/**
 * Server Action: Permanently Delete a Member (Player, Teacher, Manager)
 */
export async function deleteMemberAction(
  userId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    if (!userId) {
      return { error: "User ID is required." };
    }

    // 1. Clear team leadership if this user is a captain
    await supabaseAdmin
      .from("teams")
      .update({ leader_id: null })
      .eq("leader_id", userId);

    // 2. Delete from public.users
    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", userId);

    if (dbError) throw dbError;

    // 3. Delete from Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) {
      console.warn("Auth deletion warning (user might only exist in public.users):", authError);
    }

    revalidatePath("/admin/campuses");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Member Error:", err);
    return { error: err.message || "Failed to delete member." };
  }
}

/**
 * High-Speed Single Campus Fetcher
 */
export async function getSingleCampusData(campusId: string) {
  try {
    const { data: campus, error: campusError } = await supabaseAdmin
      .from("campuses")
      .select("*")
      .eq("id", campusId)
      .single();

    if (campusError || !campus) return null;

    // Concurrently fetch leadership, squads, and enrolled students
    const [managerRes, teachersRes, teamsRes, studentsRes] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("*")
        .eq("campus_id", campusId)
        .eq("role", "CAMPUS_MANAGER")
        .maybeSingle(),
      supabaseAdmin
        .from("users")
        .select("*")
        .eq("campus_id", campusId)
        .eq("role", "TEACHER"),
      supabaseAdmin
        .from("teams")
        .select("*, leader:users!leader_id(id, full_name, ign, avatar_url, roll_number)")
        .eq("campus_id", campusId),
      supabaseAdmin
        .from("users")
        .select("*, team:teams(id, name)")
        .eq("campus_id", campusId)
        .eq("role", "STUDENT"),
    ]);

    const teams = teamsRes.data || [];
    const teamIds = teams.map((t) => t.id);

    // Fetch team members if any squads exist
    let teamMembers: any[] = [];
    if (teamIds.length > 0) {
      const { data: tm } = await supabaseAdmin
        .from("users")
        .select("*")
        .in("team_id", teamIds);
      teamMembers = tm || [];
    }

    // Map emails
    let emailsMap = new Map<string, string>();
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          if (u.email) emailsMap.set(u.id, u.email);
        }
      }
    } catch {
      // ignore
    }

    const populatedTeams = teams.map((team) => ({
      ...team,
      members: teamMembers
        .filter((m) => m.team_id === team.id)
        .map((m) => ({
          ...m,
          email: emailsMap.get(m.id) || `${m.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
          is_team_leader: team.leader_id === m.id,
        })),
      member_count: teamMembers.filter((m) => m.team_id === team.id).length,
    }));

    // Merge students from direct campus assignment AND squad membership
    const studentMap = new Map<string, any>();
    for (const s of (studentsRes.data || [])) {
      studentMap.set(s.id, {
        ...s,
        email: emailsMap.get(s.id) || `${s.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        team_name: s.team?.name || undefined,
        is_team_leader: s.team_id ? teams.find((t) => t.id === s.team_id)?.leader_id === s.id : false,
      });
    }

    for (const tm of teamMembers) {
      if (tm.role === "STUDENT" && !studentMap.has(tm.id)) {
        const teamObj = teams.find((t) => t.id === tm.team_id);
        studentMap.set(tm.id, {
          ...tm,
          email: emailsMap.get(tm.id) || `${tm.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
          team_name: teamObj?.name || undefined,
          is_team_leader: teamObj?.leader_id === tm.id,
        });
      }
    }

    const allCampusStudents = Array.from(studentMap.values());

    const enrichedManager = managerRes.data
      ? {
          ...managerRes.data,
          email: emailsMap.get(managerRes.data.id) || `${managerRes.data.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        }
      : null;

    const enrichedTeachers = (teachersRes.data || []).map((t) => ({
      ...t,
      email: emailsMap.get(t.id) || `${t.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
    }));

    return {
      campus,
      manager: enrichedManager,
      teachers: enrichedTeachers,
      teams: populatedTeams,
      students: allCampusStudents,
    };
  } catch (err) {
    console.error("Error in getSingleCampusData:", err);
    return null;
  }
}

/**
 * High-Speed Single Team Fetcher
 */
export async function getSingleTeamData(teamId: string) {
  try {
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .maybeSingle();

    if (teamError || !team) return null;

    const [campusRes, leaderRes, membersRes] = await Promise.all([
      team.campus_id
        ? supabaseAdmin.from("campuses").select("*").eq("id", team.campus_id).maybeSingle()
        : Promise.resolve({ data: null }),
      team.leader_id
        ? supabaseAdmin.from("users").select("*").eq("id", team.leader_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin.from("users").select("*").eq("team_id", teamId),
    ]);

    // Map emails
    let emailsMap = new Map<string, string>();
    try {
      const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
      if (authUsers?.users) {
        for (const u of authUsers.users) {
          if (u.email) emailsMap.set(u.id, u.email);
        }
      }
    } catch {
      // ignore
    }

    const enrichedMembers = (membersRes.data || []).map((m) => ({
      ...m,
      email: emailsMap.get(m.id) || `${m.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
      is_team_leader: team.leader_id === m.id,
      academic_program: "Faculty of Sciences (FSc Pre-Engineering)",
    }));

    const enrichedLeader = leaderRes.data
      ? {
          ...leaderRes.data,
          email: emailsMap.get(leaderRes.data.id) || `${leaderRes.data.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
          is_team_leader: true,
          academic_program: "Faculty of Sciences (FSc Pre-Engineering)",
        }
      : null;

    return {
      team,
      campus: campusRes.data || null,
      leader: enrichedLeader,
      members: enrichedMembers,
    };
  } catch (err) {
    console.error("Error in getSingleTeamData:", err);
    return null;
  }
}

/**
 * High-Speed Single User Profile Fetcher
 */
export async function getSingleUserData(userId: string) {
  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      console.error("getSingleUserData user error:", userError);
      return null;
    }

    // 1. Fetch team if assigned or leading
    let teamData: any = null;
    if (user.team_id) {
      const { data: team } = await supabaseAdmin
        .from("teams")
        .select("*")
        .eq("id", user.team_id)
        .maybeSingle();
      teamData = team;
    } else {
      // Check if user is leader of any team
      const { data: ledTeam } = await supabaseAdmin
        .from("teams")
        .select("*")
        .eq("leader_id", user.id)
        .maybeSingle();
      if (ledTeam) {
        teamData = ledTeam;
      }
    }

    // 2. Fetch campus (from user.campus_id OR teamData.campus_id)
    const effectiveCampusId = user.campus_id || teamData?.campus_id;
    let campusData: any = null;
    if (effectiveCampusId) {
      const { data: campus } = await supabaseAdmin
        .from("campuses")
        .select("*")
        .eq("id", effectiveCampusId)
        .maybeSingle();
      campusData = campus;
    }

    // 3. Fetch auth email for complete admin profile visibility
    let authEmail = "";
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (authData?.user?.email) {
        authEmail = authData.user.email;
      }
    } catch {
      // ignore
    }

    const isLeader = teamData ? teamData.leader_id === user.id : false;
    const eloRating = teamData ? (teamData.elo_rating ?? 1000) : 1000;

    return {
      user: {
        ...user,
        email: authEmail || `${user.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        is_team_leader: isLeader,
        elo_rating: eloRating,
      },
      campus: campusData,
      team: teamData,
    };
  } catch (err) {
    console.error("Error in getSingleUserData:", err);
    return null;
  }
}
