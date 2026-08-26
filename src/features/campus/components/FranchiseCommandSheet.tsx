"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  ShieldAlert,
  Users,
  Trophy,
  Crown,
  GraduationCap,
  Flame,
  Shield,
  Mail,
} from "lucide-react";
import type { CampusItem } from "../types/campusTypes";

interface FranchiseCommandSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campus: CampusItem | null;
}

export function FranchiseCommandSheet({
  isOpen,
  onOpenChange,
  campus,
}: FranchiseCommandSheetProps) {
  if (!campus) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md md:max-w-xl lg:max-w-2xl bg-[#0B0C16]/90 backdrop-blur-xl border-white/10 text-white overflow-y-auto">
        <SheetHeader className="border-b border-white/10 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle className="font-display text-2xl font-bold text-white tracking-tight">
                {campus.name}
              </SheetTitle>
              <SheetDescription className="text-white/45 flex items-center gap-1.5 mt-1 text-xs">
                <MapPin className="w-3.5 h-3.5 text-pgc-red" />
                {campus.region}
              </SheetDescription>
            </div>
            <Badge
              variant="outline"
              className="bg-pgc-emerald/10 text-pgc-emerald border-pgc-emerald/30 font-medium text-xs shrink-0"
            >
              {campus.status}
            </Badge>
          </div>
        </SheetHeader>

        <div className="mt-6 flex-1">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start bg-black/40 border border-white/5 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg px-3.5 text-xs font-semibold"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="teams"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg px-3.5 text-xs font-semibold"
              >
                Teams ({campus.teams.length})
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg px-3.5 text-xs font-semibold"
              >
                Faculty ({campus.teachers.length + (campus.manager ? 1 : 0)})
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 rounded-lg px-3.5 text-xs font-semibold"
              >
                Students ({campus.students.length})
              </TabsTrigger>
            </TabsList>

            {/* 1. Overview Tab */}
            <TabsContent value="overview" className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-1">Campus Manager</p>
                  <p className="text-sm font-bold text-white">
                    {campus.manager ? campus.manager.full_name : "Unassigned"}
                  </p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-1">Active Esports Teams</p>
                  <p className="text-sm font-bold text-pgc-gold flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" />
                    {campus.teams.length} Squads
                  </p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-1">Total Students</p>
                  <p className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" />
                    {campus.students.length} Enrolled
                  </p>
                </div>
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-1">Security &amp; Status</p>
                  <p className="text-sm font-semibold text-pgc-emerald flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Operational
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* 2. Teams Tab */}
            <TabsContent value="teams" className="mt-5 space-y-3">
              {campus.teams.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center text-white/40 text-xs">
                  No esports teams created for this campus yet.
                </div>
              ) : (
                campus.teams.map((team) => (
                  <div key={team.id} className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                          <Flame className="w-4 h-4 text-pgc-red" />
                          {team.name}
                        </h4>
                        <p className="text-xs text-white/40 mt-0.5">{team.members.length} Squad Members</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-pgc-gold/10 border border-pgc-gold/30 text-pgc-gold font-display font-bold text-xs">
                        {team.elo_rating} ELO
                      </span>
                    </div>

                    {/* Captain Banner */}
                    <div className="bg-pgc-gold/10 border border-pgc-gold/30 rounded-lg p-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-pgc-gold" />
                        <div>
                          <span className="text-[10px] uppercase font-bold text-pgc-gold block">
                            Team Captain
                          </span>
                          <span className="text-xs font-semibold text-white">
                            {team.leader ? team.leader.full_name : "Unassigned"}
                          </span>
                        </div>
                      </div>
                      {team.leader?.ign && (
                        <span className="text-xs font-mono text-pgc-gold">#{team.leader.ign}</span>
                      )}
                    </div>

                    {/* Member list */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase text-white/40 block">Squad Roster:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {team.members.map((m) => (
                          <span
                            key={m.id}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              m.is_team_leader
                                ? "bg-pgc-gold/15 text-pgc-gold border-pgc-gold/40"
                                : "bg-white/[0.04] text-white/70 border-white/10"
                            }`}
                          >
                            {m.full_name} {m.ign ? `(${m.ign})` : ""}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            {/* 3. Faculty / Staff Tab */}
            <TabsContent value="staff" className="mt-5 space-y-3">
              {campus.manager && (
                <div className="bg-white/[0.03] border border-cyan-500/30 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xs">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{campus.manager.full_name}</p>
                      <p className="text-xs text-cyan-400 font-medium">Campus Manager • {campus.manager.roll_number || "MGR"}</p>
                    </div>
                  </div>
                  {campus.manager.email && (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {campus.manager.email}
                    </span>
                  )}
                </div>
              )}

              {campus.teachers.map((t) => (
                <div key={t.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{t.full_name}</p>
                      <p className="text-xs text-purple-300 font-medium">Teacher / Coach • {t.roll_number}</p>
                    </div>
                  </div>
                  {t.email && (
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {t.email}
                    </span>
                  )}
                </div>
              ))}
            </TabsContent>

            {/* 4. Students Tab */}
            <TabsContent value="students" className="mt-5 space-y-2">
              {campus.students.map((s) => (
                <div
                  key={s.id}
                  className="bg-white/[0.02] border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-[11px] ${
                        s.is_team_leader
                          ? "bg-pgc-gold/20 text-pgc-gold border border-pgc-gold/40"
                          : "bg-white/[0.05] text-white/70"
                      }`}
                    >
                      {s.is_team_leader ? <Crown className="w-3.5 h-3.5" /> : s.full_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{s.full_name}</span>
                        {s.ign && <span className="font-mono text-pgc-gold text-[10px]">#{s.ign}</span>}
                        {s.is_team_leader && (
                          <span className="px-1.5 py-0.2 rounded bg-pgc-gold/20 text-pgc-gold text-[9px] font-bold uppercase">
                            Captain
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/40">{s.roll_number}</p>
                    </div>
                  </div>

                  <div>
                    {s.team_name ? (
                      <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10 text-white/70 text-[11px]">
                        {s.team_name}
                      </span>
                    ) : (
                      <span className="text-white/30 italic text-[11px]">Unassigned</span>
                    )}
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
