import type { Metadata } from "next";
import { LayoutDashboard, Users, Trophy, Flame, TrendingUp, Building2, Crown, Sparkles } from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Command Center — PGC Arena Admin",
  description: "Super Admin global overview: campuses, live matches, and system health.",
};

export default async function AdminCommandCenterPage() {
  // Concurrently fetch system-wide metrics
  const [campusesRes, studentsRes, teamsRes, teachersRes] = await Promise.all([
    supabaseAdmin.from("campuses").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "STUDENT"),
    supabaseAdmin.from("teams").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "TEACHER"),
  ]);

  const campusCount = campusesRes.count ?? 0;
  const studentCount = studentsRes.count ?? 0;
  const teamCount = teamsRes.count ?? 0;
  const teacherCount = teachersRes.count ?? 0;

  const statCards = [
    {
      label: "Total Campuses",
      value: campusCount.toString(),
      icon: Building2,
      color: "text-pgc-red",
      href: "/admin/campuses",
      sublabel: "Regional campuses & branches",
    },
    {
      label: "Active Student Players",
      value: studentCount.toString(),
      icon: Users,
      color: "text-cyan-400",
      href: "/admin/campuses",
      sublabel: "Enrolled esports athletes",
    },
    {
      label: "Esports Squads",
      value: teamCount.toString(),
      icon: Flame,
      color: "text-pgc-gold",
      href: "/admin/campuses",
      sublabel: "Registered tournament teams",
    },
    {
      label: "Faculty Coaches",
      value: teacherCount.toString(),
      icon: Crown,
      color: "text-purple-400",
      href: "/admin/campuses",
      sublabel: "Campus leads & examiners",
    },
  ];

  return (
    <div className="flex flex-col gap-8 font-sans">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight">
            Command <span className="text-pgc-red">Center</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            Institutional tournament management, campus branches, and live esports operations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            prefetch={true}
            href="/admin/campuses"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pgc-red hover:bg-pgc-hover text-white text-xs font-bold transition-all shadow-[0_0_20px_rgba(227,59,41,0.25)] cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Campuses &amp; Rosters</span>
          </Link>
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, href, sublabel }) => (
          <Link
            key={label}
            prefetch={true}
            href={href}
            className="group rounded-2xl p-5 bg-white/[0.03] border border-white/[0.08] backdrop-blur-md hover:bg-white/[0.06] hover:border-white/[0.14] transition-all duration-200 block"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-display">
                {label}
              </p>
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`font-display text-4xl font-black ${color}`}>{value}</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">{sublabel}</p>
          </Link>
        ))}
      </div>

      {/* ── Quick Overview Banner ─────────────────────────────────── */}
      <div className="rounded-2xl p-8 bg-gradient-to-r from-pgc-indigo/60 via-black/60 to-black/80 border border-white/[0.08] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              System Operational
            </span>
          </div>
          <h3 className="font-display font-black text-xl text-white">
            PGC Arena Tournament Engine Active
          </h3>
          <p className="text-xs text-slate-400 max-w-xl font-normal">
            All regional campuses, student athletes, and competitive squads are synced with real-time match servers.
          </p>
        </div>

        <Link
          prefetch={true}
          href="/admin/campuses"
          className="px-5 py-3 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white text-xs font-bold transition-all shrink-0 font-sans text-center"
        >
          View Campus Directory &rarr;
        </Link>
      </div>
    </div>
  );
}
