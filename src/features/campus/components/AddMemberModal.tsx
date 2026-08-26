"use client";

import { useState } from "react";
import { UserPlus, Mail, Lock, Shield, Building2, Flame, Crown, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { addMemberAction } from "../actions/campusActions";
import type { CampusItem, TeamItem, UserRole } from "../types/campusTypes";

interface AddMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campuses: CampusItem[];
  teams: TeamItem[];
  defaultCampusId?: string | null;
  onSuccess?: () => void;
}

export function AddMemberModal({
  isOpen,
  onOpenChange,
  campuses,
  teams,
  defaultCampusId,
  onSuccess,
}: AddMemberModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("PgcArena123!");
  const [role, setRole] = useState<UserRole>("STUDENT");
  const [rollNumber, setRollNumber] = useState("");
  const [campusId, setCampusId] = useState(defaultCampusId || (campuses[0]?.id ?? ""));
  const [teamId, setTeamId] = useState("");
  const [ign, setIgn] = useState("");
  const [isCaptain, setIsCaptain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teams available in the chosen campus
  const availableTeams = teams.filter((t) => !campusId || t.campus_id === campusId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !rollNumber.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await addMemberAction({
      full_name: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      role: role,
      roll_number: rollNumber.trim(),
      campus_id: campusId || null,
      team_id: role === "STUDENT" && teamId ? teamId : null,
      ign: role === "STUDENT" && ign ? ign.trim() : null,
      is_captain: role === "STUDENT" && isCaptain,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setFullName("");
      setEmail("");
      setRollNumber("");
      setIgn("");
      setIsCaptain(false);
      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/95 border-white/10 text-white max-w-lg backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-pgc-emerald/20 text-pgc-emerald flex items-center justify-center mb-2">
            <UserPlus className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">Add Member</DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            Enroll a new student player, assign faculty teacher, or appoint a campus manager.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Full Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
              Full Name
            </label>
            <Input
              placeholder="e.g. Hassan Raza"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white placeholder-white/30"
              autoFocus
            />
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="user@pgc.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9 bg-black/40 border-white/10 text-white placeholder-white/30 text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-9 bg-black/40 border-white/10 text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Role & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
                Account Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-pgc-red/60 cursor-pointer appearance-none"
                >
                  <option value="STUDENT" className="bg-[#0B0C16] text-white">Student / Esports Player</option>
                  <option value="TEACHER" className="bg-[#0B0C16] text-white">Teacher / Coach</option>
                  <option value="CAMPUS_MANAGER" className="bg-[#0B0C16] text-white">Campus Manager</option>
                  <option value="SUPER_ADMIN" className="bg-[#0B0C16] text-white">Super Admin</option>
                </select>
                <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
                Roll No / Employee ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="e.g. LHR-23-01 or MGR-001"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  className="pl-9 bg-black/40 border-white/10 text-white placeholder-white/30 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Campus Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
              Assigned Campus
            </label>
            <div className="relative">
              <select
                value={campusId}
                onChange={(e) => {
                  setCampusId(e.target.value);
                  setTeamId("");
                }}
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-pgc-red/60 cursor-pointer appearance-none"
              >
                <option value="" className="bg-[#0B0C16] text-white/60">Global / Head Office</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0B0C16] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Student-Specific Fields: Team, IGN & Captaincy */}
          {role === "STUDENT" && (
            <div className="space-y-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
              <span className="text-[11px] font-bold text-pgc-gold uppercase tracking-wider block">
                Esports Player Profile
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-white/60 mb-1 block">
                    In-Game Name (IGN)
                  </label>
                  <Input
                    placeholder="e.g. CyberKhan, Shadow"
                    value={ign}
                    onChange={(e) => setIgn(e.target.value)}
                    className="bg-black/40 border-white/10 text-white placeholder-white/30 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-white/60 mb-1 block">
                    Assign Squad / Team
                  </label>
                  <div className="relative">
                    <select
                      value={teamId}
                      onChange={(e) => setTeamId(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-pgc-red/60 cursor-pointer appearance-none"
                    >
                      <option value="" className="bg-[#0B0C16] text-white/60">
                        Unassigned (Reserve)
                      </option>
                      {availableTeams.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#0B0C16] text-white">
                          {t.name} ({t.members.length} members)
                        </option>
                      ))}
                    </select>
                    <Flame className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pgc-red pointer-events-none" />
                  </div>
                </div>
              </div>

              {teamId && (
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCaptain}
                    onChange={(e) => setIsCaptain(e.target.checked)}
                    className="w-4 h-4 rounded bg-black/40 border-white/20 text-pgc-gold focus:ring-pgc-gold cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-pgc-gold flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    Designate as Team Captain
                  </span>
                </label>
              )}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-pgc-red/10 border border-pgc-red/30 text-xs text-pgc-red">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-pgc-red text-white text-xs font-semibold hover:bg-pgc-hover active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? "Adding Member..." : "Add Member"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
