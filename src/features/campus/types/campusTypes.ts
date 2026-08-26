export type UserRole = "SUPER_ADMIN" | "CAMPUS_MANAGER" | "TEACHER" | "STUDENT";

export interface MemberItem {
  id: string;
  full_name: string;
  email?: string;
  role: UserRole;
  roll_number: string;
  campus_id: string | null;
  campus_name?: string;
  campus_logo_url?: string | null;
  team_id: string | null;
  team_name?: string;
  team_logo_url?: string | null;
  ign?: string | null;
  elo_rating?: number;
  is_team_leader: boolean; // Dynamically derived captain/leader flag
  avatar_url?: string | null;
  status: "Active" | "Pending" | "Offline";
  academic_program?: string;
}

export interface TeamItem {
  id: string;
  name: string;
  campus_id: string;
  campus_name: string;
  campus_logo_url?: string | null;
  leader_id: string | null;
  leader?: MemberItem | null;
  logo_url?: string | null;
  banner_url?: string | null;
  elo_rating: number;
  status: "Active" | "Inactive" | "Recruiting";
  member_count: number;
  members: MemberItem[];
  created_at?: string | null;
}

export interface CampusItem {
  id: string;
  name: string;
  region: string;
  logo_url?: string | null;
  banner_url?: string | null;
  manager: {
    id: string;
    full_name: string;
    email?: string;
    roll_number?: string;
    avatar_url?: string | null;
  } | null;
  teachersCount: number;
  activeTeamsCount: number;
  totalStudentsCount: number;
  status: "Active" | "Pending" | "Suspended";
  isStarred?: boolean;
  teams: TeamItem[];
  teachers: MemberItem[];
  students: MemberItem[];
}

export interface SavedFilterPreset {
  id: string;
  label: string;
  description?: string;
  iconName: "star" | "users" | "graduation-cap" | "crown" | "shield" | "sparkles" | "bookmark";
  filters: {
    searchQuery?: string;
    role?: string;
    campusId?: string;
    status?: string;
    isLeaderOnly?: boolean;
    unassignedOnly?: boolean;
    isStarredOnly?: boolean;
  };
  isCustom?: boolean;
}
