"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireSuperAdmin } from "@/lib/supabase/rbac";
import type { CampusItem, MemberItem, TeamItem, UserRole } from "../types/campusTypes";

// ── Validation Schemas ───────────────────────────────────────────

const createCampusSchema = z.object({
  name: z.string().min(3, "Campus name must be at least 3 characters"),
  region: z.string().optional(),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
});

const createTeamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  campus_id: z.string().uuid("Invalid Campus ID"),
  leader_id: z.string().uuid("Invalid Leader ID").optional().nullable().or(z.literal("")),
  elo_rating: z.coerce.number().optional().default(0),
  logo_url: z.string().url().optional().nullable().or(z.literal("")),
  banner_url: z.string().url().optional().nullable().or(z.literal("")),
});

const addMemberSchema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER", "STUDENT"]),
  roll_number: z.string().min(6, "Roll Number / Employee ID must be at least 6 characters"),
  campus_id: z.string().uuid().optional().nullable().or(z.literal("")),
  team_id: z.string().uuid().optional().nullable().or(z.literal("")),
  ign: z.string().min(6, "In-Game Name (IGN) must be at least 6 characters").optional().nullable().or(z.literal("")),
  is_captain: z.boolean().optional().default(false),
  avatar_url: z.string().url().optional().nullable().or(z.literal("")),
});

// ── Server Actions ───────────────────────────────────────────────

/**
 * Fetch all campuses, teams, and users dynamically from Supabase
 * and construct the hierarchical structure and flat directory.
 * Security: Requires authenticated session with SUPER_ADMIN or CAMPUS_MANAGER role.
 */
export async function getCampusesData(): Promise<{
  success: boolean;
  campuses: CampusItem[];
  allMembers: MemberItem[];
  allTeams: TeamItem[];
  error?: string;
}> {
  // 0. RBAC Verification
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER"]);
  if (!auth.authorized) {
    return {
      success: false,
      campuses: [],
      allMembers: [],
      allTeams: [],
      error: auth.error,
    };
  }

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

    // Construct flat members list with dynamic is_team_leader and campus inheritance derivation
    const allMembers: MemberItem[] = (usersRaw || []).map((u) => {
      const team = u.team_id ? teamMap.get(u.team_id) : undefined;
      const isLeader = team ? team.leader_id === u.id : false;
      const effectiveCampusId = u.campus_id || team?.campus_id || null;
      const campusName = effectiveCampusId ? campusMap.get(effectiveCampusId) || "Unknown Campus" : "Global / Head Office";
      const campusLogo = effectiveCampusId ? campusLogoMap.get(effectiveCampusId) || null : null;

      return {
        id: u.id,
        full_name: u.full_name,
        email: emailsMap.get(u.id) || `${u.roll_number.toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        role: u.role as UserRole,
        roll_number: u.roll_number,
        campus_id: effectiveCampusId,
        campus_name: campusName,
        campus_logo_url: campusLogo,
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
      const campusTeamIds = new Set(campusTeams.map((t) => t.id));
      const campusMembers = allMembers.filter(
        (m) => m.campus_id === c.id || (m.team_id && campusTeamIds.has(m.team_id))
      );
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
 * Security: Requires SUPER_ADMIN role.
 */
export async function createCampusAction(data: {
  name: string;
  region?: string;
  logo_url?: string | null;
  banner_url?: string | null;
}) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

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
      .insert({
        name: formattedName,
        logo_url: data.logo_url || null,
        banner_url: data.banner_url || null,
      })
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
 * Security: Requires SUPER_ADMIN role.
 */
export async function createTeamAction(data: {
  name: string;
  campus_id: string;
  leader_id?: string | null;
  elo_rating?: number;
  logo_url?: string | null;
  banner_url?: string | null;
}) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

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
        elo_rating: data.elo_rating ?? 0,
        logo_url: data.logo_url || null,
        banner_url: data.banner_url || null,
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
 * Security: Requires SUPER_ADMIN role.
 */
export async function addMemberAction(data: {
  fullName?: string;
  full_name?: string;
  email: string;
  password?: string;
  role: "SUPER_ADMIN" | "CAMPUS_MANAGER" | "TEACHER" | "STUDENT";
  rollNumber?: string;
  roll_number?: string;
  campusId?: string | null;
  campus_id?: string | null;
  teamId?: string | null;
  team_id?: string | null;
  ign?: string | null;
  isCaptain?: boolean;
  is_captain?: boolean;
  avatarUrl?: string | null;
  avatar_url?: string | null;
}) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  const normalizedData = {
    full_name: data.full_name || data.fullName,
    email: data.email,
    password: data.password || "PgcArena123!",
    role: data.role,
    roll_number: data.roll_number || data.rollNumber,
    campus_id: data.campus_id || data.campusId || null,
    team_id: data.team_id || data.teamId || null,
    ign: data.ign || null,
    is_captain: data.is_captain ?? data.isCaptain ?? false,
    avatar_url: data.avatar_url || data.avatarUrl || null,
  };

  const result = addMemberSchema.safeParse(normalizedData);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { full_name, email, password, role, roll_number, ign, is_captain, avatar_url } = result.data;
  let campus_id = result.data.campus_id || null;
  const team_id = result.data.team_id || null;

  try {
    // If team_id is provided but campus_id is null, inherit campus from team
    if (!campus_id && team_id) {
      const { data: teamData } = await supabaseAdmin
        .from("teams")
        .select("campus_id")
        .eq("id", team_id)
        .maybeSingle();
      if (teamData?.campus_id) {
        campus_id = teamData.campus_id;
      }
    }

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
      avatar_url: avatar_url || null,
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
    return { success: true, message: `${full_name} has been enrolled successfully.` };
  } catch (error: any) {
    console.error("Add Member Error:", error);
    return { error: error.message || "An unexpected error occurred." };
  }
}

/**
 * Server Action: Assign Team Captain / Leader
 * Security: Requires SUPER_ADMIN role.
 */
export async function assignTeamLeaderAction(teamId: string, studentId: string | null) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

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
 * Security: Requires authenticated session.
 */
export async function checkIgnAvailabilityAction(
  ign: string
): Promise<{ available: boolean; takenBy?: string; tooShort?: boolean; error?: string }> {
  // 0. Authentication Check
  const auth = await requireAuth();
  if (!auth.authorized) {
    return { available: false, error: auth.error };
  }

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
 * Security: Requires authenticated session.
 */
export async function checkRollNumberAvailabilityAction(
  rollNumber: string
): Promise<{ available: boolean; takenBy?: string; tooShort?: boolean; error?: string }> {
  // 0. Authentication Check
  const auth = await requireAuth();
  if (!auth.authorized) {
    return { available: false, error: auth.error };
  }

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
 * Security: Requires SUPER_ADMIN role.
 */
export async function deleteCampusAction(
  campusId: string
): Promise<{ success?: boolean; error?: string }> {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    if (!campusId) {
      return { success: false, error: "Campus ID is required." };
    }

    // 1. Delete the campus record
    const { error } = await supabaseAdmin
      .from("campuses")
      .delete()
      .eq("id", campusId);

    if (error) throw error;

    revalidatePath("/admin/campuses");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Campus Error:", err);
    return { success: false, error: err.message || "Failed to delete campus." };
  }
}

/**
 * Server Action: Permanently Delete an Esports Team
 * Security: Requires SUPER_ADMIN role.
 */
export async function deleteTeamAction(
  teamId: string
): Promise<{ success?: boolean; error?: string }> {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    if (!teamId) {
      return { success: false, error: "Team ID is required." };
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
    return { success: false, error: err.message || "Failed to delete team." };
  }
}

/**
 * Server Action: Permanently Delete a Member (Player, Teacher, Manager)
 * Security: Requires SUPER_ADMIN role.
 */
export async function deleteMemberAction(
  userId: string
): Promise<{ success?: boolean; error?: string }> {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    if (!userId) {
      return { success: false, error: "User ID is required." };
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
    return { success: false, error: err.message || "Failed to delete member." };
  }
}

/**
 * High-Speed Single Campus Fetcher (Architecturally Optimized - Single Roundtrip Batch)
 * Security: Requires authenticated session.
 */
export async function getSingleCampusData(campusId: string) {
  // 0. RBAC Check
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    console.warn("getSingleCampusData unauthorized attempt:", auth.error);
    return null;
  }

  try {
    // Concurrently fetch campus, all campus users, and all campus squads
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
    if (campusRes.error || !campus) return null;

    const teams = teamsRes.data || [];
    const teamIds = teams.map((t) => t.id);
    const teamIdSet = new Set(teamIds);

    // Also fetch squad members if any belong to squads in this campus
    let squadUsers: any[] = [];
    if (teamIds.length > 0) {
      const { data: su } = await supabaseAdmin
        .from("users")
        .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
        .in("team_id", teamIds);
      squadUsers = su || [];
    }

    // Merge direct users and squad users by user ID
    const userMap = new Map<string, any>();
    for (const u of directUsersRes.data || []) {
      userMap.set(u.id, u);
    }
    for (const u of squadUsers) {
      if (!userMap.has(u.id)) {
        userMap.set(u.id, u);
      }
    }

    const allUsers = Array.from(userMap.values());

    // Segregate users in-memory (0 extra roundtrips)
    const manager = allUsers.find((u) => u.role === "CAMPUS_MANAGER") || null;
    const teachers = allUsers.filter((u) => u.role === "TEACHER");
    const directStudents = allUsers.filter((u) => u.role === "STUDENT");

    // Populate team rosters from campus users
    const populatedTeams = teams.map((team) => {
      const squadPlayers = directStudents.filter((m) => m.team_id === team.id);
      return {
        ...team,
        members: squadPlayers.map((m) => ({
          ...m,
          email: `${(m.roll_number || m.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
          is_team_leader: team.leader_id === m.id,
        })),
        member_count: squadPlayers.length,
      };
    });

    // Merge students
    const studentMap = new Map<string, any>();
    for (const s of directStudents) {
      const teamObj = teams.find((t) => t.id === s.team_id);
      studentMap.set(s.id, {
        ...s,
        email: `${(s.roll_number || s.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        team_name: teamObj?.name || undefined,
        is_team_leader: s.team_id && teamIdSet.has(s.team_id)
          ? teamObj?.leader_id === s.id
          : false,
      });
    }

    const allCampusStudents = Array.from(studentMap.values());

    const enrichedManager = manager
      ? {
          ...manager,
          email: `${(manager.roll_number || manager.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
        }
      : null;

    const enrichedTeachers = teachers.map((t) => ({
      ...t,
      email: `${(t.roll_number || t.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
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
 * High-Speed Single Team Fetcher (Architecturally Optimized - Single Roundtrip Batch)
 * Security: Requires authenticated session.
 */
export async function getSingleTeamData(teamId: string) {
  // 0. RBAC Check
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER", "STUDENT"]);
  if (!auth.authorized) {
    console.warn("getSingleTeamData unauthorized attempt:", auth.error);
    return null;
  }

  try {
    const { data: team, error: teamError } = await supabaseAdmin
      .from("teams")
      .select("id, name, campus_id, leader_id, elo_rating, logo_url, banner_url, created_at")
      .eq("id", teamId)
      .maybeSingle();

    if (teamError || !team) return null;

    const [campusRes, leaderRes, membersRes] = await Promise.all([
      team.campus_id
        ? supabaseAdmin
            .from("campuses")
            .select("id, name, region, logo_url, banner_url")
            .eq("id", team.campus_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      team.leader_id
        ? supabaseAdmin
            .from("users")
            .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
            .eq("id", team.leader_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin
        .from("users")
        .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
        .eq("team_id", teamId),
    ]);

    const enrichedMembers = (membersRes.data || []).map((m) => ({
      ...m,
      email: `${(m.roll_number || m.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
      is_team_leader: team.leader_id === m.id,
      academic_program: "Faculty of Sciences (FSc Pre-Engineering)",
    }));

    const enrichedLeader = leaderRes.data
      ? {
          ...leaderRes.data,
          email: `${(leaderRes.data.roll_number || leaderRes.data.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
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
 * High-Speed Single User Profile Fetcher (Architecturally Optimized)
 * Security: Requires authenticated session.
 */
export async function getSingleUserData(userId: string) {
  // 0. RBAC Check
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER", "STUDENT"]);
  if (!auth.authorized) {
    console.warn("getSingleUserData unauthorized attempt:", auth.error);
    return null;
  }

  try {
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, full_name, role, roll_number, ign, avatar_url, campus_id, team_id")
      .eq("id", userId)
      .maybeSingle();

    if (userError || !user) {
      console.error("getSingleUserData user error:", userError);
      return null;
    }

    // 1. Concurrently fetch team and/or led team
    let teamData: any = null;
    if (user.team_id) {
      const { data: team } = await supabaseAdmin
        .from("teams")
        .select("id, name, campus_id, leader_id, elo_rating, logo_url, banner_url")
        .eq("id", user.team_id)
        .maybeSingle();
      teamData = team;
    } else {
      const { data: ledTeam } = await supabaseAdmin
        .from("teams")
        .select("id, name, campus_id, leader_id, elo_rating, logo_url, banner_url")
        .eq("leader_id", user.id)
        .maybeSingle();
      if (ledTeam) {
        teamData = ledTeam;
      }
    }

    // 2. Fetch campus
    const effectiveCampusId = user.campus_id || teamData?.campus_id;
    let campusData: any = null;
    if (effectiveCampusId) {
      const { data: campus } = await supabaseAdmin
        .from("campuses")
        .select("id, name, region, logo_url, banner_url")
        .eq("id", effectiveCampusId)
        .maybeSingle();
      campusData = campus;
    }

    const isLeader = teamData ? teamData.leader_id === user.id : false;
    const eloRating = teamData ? (teamData.elo_rating ?? 1000) : 1000;

    return {
      user: {
        ...user,
        email: `${(user.roll_number || user.id.slice(0, 8)).toLowerCase().replace(/[^a-z0-9]/g, "")}@pgc.edu`,
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

/**
 * Server Action: Update an existing Campus
 * Security: Requires SUPER_ADMIN role.
 */
export async function updateCampusAction(
  campusId: string,
  data: {
    name: string;
    region?: string;
    logo_url?: string | null;
    banner_url?: string | null;
    manager_id?: string | null;
  }
) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  try {
    const formattedName =
      data.region && !data.name.includes("(")
        ? `${data.name} (${data.region})`
        : data.name;

    const { error: campusError } = await supabaseAdmin
      .from("campuses")
      .update({
        name: formattedName,
        logo_url: data.logo_url ?? null,
        banner_url: data.banner_url ?? null,
      })
      .eq("id", campusId);

    if (campusError) throw campusError;

    // Manage Campus Manager Assignment
    if (data.manager_id !== undefined) {
      if (data.manager_id) {
        // Unassign any manager currently attached to this campus
        await supabaseAdmin
          .from("users")
          .update({ campus_id: null })
          .eq("campus_id", campusId)
          .eq("role", "CAMPUS_MANAGER");

        // Assign the new manager
        await supabaseAdmin
          .from("users")
          .update({ campus_id: campusId })
          .eq("id", data.manager_id);
      } else {
        // If manager_id is null, unassign all managers from this campus
        await supabaseAdmin
          .from("users")
          .update({ campus_id: null })
          .eq("campus_id", campusId)
          .eq("role", "CAMPUS_MANAGER");
      }
    }

    revalidatePath("/admin/campuses");
    revalidatePath(`/admin/campuses/${campusId}`);
    return { success: true, message: `Campus "${data.name}" updated successfully!` };
  } catch (error: any) {
    console.error("Update Campus Error:", error);
    return { error: error.message || "Failed to update campus." };
  }
}

/**
 * Server Action: Update an existing Esports Team
 * Security: Requires SUPER_ADMIN role.
 */
export async function updateTeamAction(
  teamId: string,
  data: {
    name: string;
    campus_id: string;
    leader_id?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  }
) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  try {
    const { error: teamError } = await supabaseAdmin
      .from("teams")
      .update({
        name: data.name,
        campus_id: data.campus_id,
        leader_id: data.leader_id || null,
        logo_url: data.logo_url ?? null,
        banner_url: data.banner_url ?? null,
      })
      .eq("id", teamId);

    if (teamError) throw teamError;

    // If a new leader is assigned, assign their team_id and campus_id
    if (data.leader_id) {
      await supabaseAdmin
        .from("users")
        .update({ team_id: teamId, campus_id: data.campus_id })
        .eq("id", data.leader_id);
    }

    revalidatePath("/admin/campuses");
    revalidatePath(`/admin/teams/${teamId}`);
    revalidatePath(`/admin/campuses/${data.campus_id}`);
    return { success: true, message: `Team "${data.name}" updated successfully!` };
  } catch (error: any) {
    console.error("Update Team Error:", error);
    return { error: error.message || "Failed to update team." };
  }
}

/**
 * Server Action: Assign Student to Team (or remove from team)
 * Security: Requires SUPER_ADMIN role.
 */
export async function assignStudentToTeamAction(studentId: string, teamId: string | null) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({ team_id: teamId })
      .eq("id", studentId);

    if (error) throw error;

    revalidatePath("/admin/campuses");
    if (teamId) revalidatePath(`/admin/teams/${teamId}`);
    return { success: true, message: "Student squad assignment updated." };
  } catch (error: any) {
    console.error("Assign Student to Team Error:", error);
    return { error: error.message || "Failed to assign student to team." };
  }
}

/**
 * Server Action: Assign Student to Campus (or transfer)
 * Security: Requires SUPER_ADMIN role.
 */
export async function assignStudentToCampusAction(studentId: string, campusId: string | null) {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { error: auth.error };
  }

  try {
    const updates: { campus_id: string | null; team_id?: string | null } = {
      campus_id: campusId,
    };
    if (campusId === null) {
      updates.team_id = null;
    }

    const { error } = await supabaseAdmin
      .from("users")
      .update(updates)
      .eq("id", studentId);

    if (error) throw error;

    revalidatePath("/admin/campuses");
    if (campusId) revalidatePath(`/admin/campuses/${campusId}`);
    return { success: true, message: "Student campus affiliation updated." };
  } catch (error: any) {
    console.error("Assign Student to Campus Error:", error);
    return { error: error.message || "Failed to update campus affiliation." };
  }
}

/**
 * Server Action: Fetch assignable candidates (all students, managers, teachers, and campuses)
 * Security: Requires SUPER_ADMIN role.
 */
export async function getAssignableDataAction() {
  // 0. Zero-Trust RBAC Check
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    console.warn("getAssignableDataAction unauthorized attempt:", auth.error);
    return { campuses: [], users: [], teams: [] };
  }

  try {
    const [campusesRes, usersRes, teamsRes] = await Promise.all([
      supabaseAdmin.from("campuses").select("id, name, logo_url, region").order("name"),
      supabaseAdmin.from("users").select("id, full_name, role, roll_number, ign, campus_id, team_id, avatar_url").order("full_name"),
      supabaseAdmin.from("teams").select("id, name, campus_id, leader_id, logo_url").order("name"),
    ]);

    return {
      campuses: campusesRes.data || [],
      users: usersRes.data || [],
      teams: teamsRes.data || [],
    };
  } catch (err: any) {
    console.error("Error fetching assignable data:", err);
    return { campuses: [], users: [], teams: [] };
  }
}
