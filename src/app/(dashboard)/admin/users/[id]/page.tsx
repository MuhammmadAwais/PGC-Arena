import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  ChevronLeft,
  Building2,
  Flame,
  Trophy,
  Crown,
  Shield,
  GraduationCap,
  Mail,
  Hash,
  Award,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { getSingleUserData } from "@/features/campus/actions/campusActions";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;
  const data = await getSingleUserData(id);

  if (!data || !data.user) {
    notFound();
  }

  const { user: member, campus, team } = data;

  const getRoleLabel = () => {
    switch (member.role) {
      case "STUDENT":
        return member.is_team_leader ? "Team Captain" : "Esports Player / Student";
      case "TEACHER":
        return "Faculty Coach / Match Host";
      case "CAMPUS_MANAGER":
        return "Regional Campus Manager";
      default:
        return member.role;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* ── 1. Top Breadcrumbs Navigation ───────────────────────── */}
      <div className="flex items-center justify-between">
        <Link
          href={campus ? `/admin/campuses/${campus.id}` : "/admin/campuses"}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors group font-sans"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
          <span>Back to {campus ? campus.name : "Campuses & Squads"}</span>
        </Link>

        <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-mono text-slate-300">
          USER ID: {member.id.slice(0, 8)}
        </span>
      </div>

      {/* ── 2. Secondary Card: Member Hero Profile Header (Top Featured) ── */}
      <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md overflow-hidden shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar Headshot */}
            {member.avatar_url ? (
              <img
                src={member.avatar_url}
                alt={member.full_name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl object-cover border-2 border-white/20 shadow-2xl shrink-0"
              />
            ) : (
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center font-display font-black text-2xl shrink-0 shadow-2xl border ${
                  member.role === "CAMPUS_MANAGER"
                    ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40"
                    : member.role === "TEACHER"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : member.is_team_leader
                    ? "bg-pgc-gold/20 text-pgc-gold border-pgc-gold/40"
                    : "bg-white/10 text-white border-white/20"
                }`}
              >
                {member.is_team_leader ? <Crown className="w-10 h-10" /> : member.full_name.charAt(0)}
              </div>
            )}

            {/* Member Identity */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${
                    member.role === "CAMPUS_MANAGER"
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
                      : member.role === "TEACHER"
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : member.is_team_leader
                      ? "bg-pgc-gold/20 text-pgc-gold border-pgc-gold/40"
                      : "bg-white/10 text-slate-300 border-white/15"
                  }`}
                >
                  {getRoleLabel()}
                </span>
                {member.ign && (
                  <span className="px-2.5 py-0.5 rounded-full bg-pgc-gold/15 text-pgc-gold border border-pgc-gold/30 text-xs font-mono font-bold">
                    #{member.ign}
                  </span>
                )}
              </div>

              <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
                {member.full_name}
              </h1>

              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-white/40" />
                  <span>{member.roll_number}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-white/40" />
                  <span>{member.email}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Student ELO Badge */}
          {member.role === "STUDENT" && (
            <div className="px-5 py-3 rounded-2xl bg-black/40 border border-pgc-gold/30 text-right shrink-0 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-display tracking-wider">
                Competitive ELO
              </span>
              <span className="font-display font-black text-2xl text-pgc-gold flex items-center justify-end gap-1.5">
                <Trophy className="w-5 h-5 text-pgc-gold" />
                {member.elo_rating ?? 1000} PTS
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Primary Summary Stats Overview Cards (Below Banner) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {member.role === "STUDENT" ? (
          <>
            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Competitive ELO</p>
                <p className="font-display text-2xl lg:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight">
                  {member.elo_rating ?? 1000} PTS
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Assigned Squad</p>
                <p className="font-display text-lg lg:text-xl font-bold text-white mt-0.5 tracking-tight truncate">
                  {team ? team.name : "Free Agent"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pgc-red/15 text-pgc-red flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Campus Branch</p>
                <p className="font-display text-lg lg:text-xl font-bold text-cyan-400 mt-0.5 tracking-tight truncate">
                  {campus ? campus.name : "Unassigned"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Roster Role</p>
                <p className="font-display text-lg lg:text-xl font-bold text-amber-400 mt-0.5 tracking-tight">
                  {member.is_team_leader ? "Captain" : "Player"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Campus Affiliation</p>
                <p className="font-display text-lg lg:text-xl font-bold text-cyan-400 mt-0.5 tracking-tight truncate">
                  {campus ? campus.name : "PGC System"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Official Role</p>
                <p className="font-display text-lg lg:text-xl font-bold text-purple-400 mt-0.5 tracking-tight">
                  {member.role === "CAMPUS_MANAGER" ? "Manager" : "Faculty"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Account Status</p>
                <p className="font-display text-lg lg:text-xl font-bold text-pgc-emerald mt-0.5 tracking-tight flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-pgc-emerald" />
                  <span>Verified</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pgc-emerald/15 text-pgc-emerald flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Privileges</p>
                <p className="font-display text-lg lg:text-xl font-bold text-white mt-0.5 tracking-tight">
                  Host / Mod
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── 4. Secondary Cards: Institutional Associations Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campus Affiliation Card */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-3 font-sans shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-display">
              Assigned Campus
            </span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>

          {campus ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {campus.logo_url ? (
                  <img src={campus.logo_url} alt={campus.name} className="w-10 h-10 rounded-xl object-contain bg-black/60 p-1 border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-display font-bold text-base text-white">{campus.name}</h3>
                  <p className="text-xs text-slate-400">{campus.region ? `${campus.region} Region` : "Official Branch"}</p>
                </div>
              </div>
              <Link
                href={`/admin/campuses/${campus.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Manage Campus Overview</span>
                <span>→</span>
              </Link>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Unassigned to a specific local campus.</p>
          )}
        </div>

        {/* Squad Affiliation Card (For Students) */}
        {member.role === "STUDENT" ? (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-3 font-sans shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-display">
                Esports Squad Roster
              </span>
              <Flame className="w-4 h-4 text-pgc-red" />
            </div>

            {team ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-pgc-red/20 text-pgc-red flex items-center justify-center font-bold">
                      <Flame className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-base text-white">{team.name}</h3>
                    <p className="text-xs text-slate-400 font-mono font-bold text-pgc-gold">{team.elo_rating} ELO Rating</p>
                  </div>
                </div>
                <Link
                  href={`/admin/teams/${team.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-pgc-red hover:text-red-400 transition-colors"
                >
                  <span>Manage Squad Roster</span>
                  <span>→</span>
                </Link>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Unassigned Free Agent / Reserve Player.</p>
            )}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-md space-y-3 font-sans shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider font-display">
                Account Privileges
              </span>
              <CheckCircle2 className="w-4 h-4 text-pgc-emerald" />
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-white font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pgc-emerald" />
                <span>Active Institutional Authorization</span>
              </p>
              <p className="text-slate-400">
                Authorized for tournament lobby hosting, match dispute arbitration, and squad roster moderation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
