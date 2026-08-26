"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Mail,
  Lock,
  Shield,
  Building2,
  Flame,
  Crown,
  Hash,
  GraduationCap,
  Users,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  addMemberAction,
  checkIgnAvailabilityAction,
  checkRollNumberAvailabilityAction,
} from "../actions/campusActions";
import type { CampusItem, TeamItem, UserRole } from "../types/campusTypes";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";
import { CloudinaryUploadZone } from "@/components/ui/CloudinaryUploadZone";

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Real-time Availability States (Requires min 6 characters)
  const [ignStatus, setIgnStatus] = useState<"idle" | "too_short" | "checking" | "available" | "taken">("idle");
  const [ignTakenBy, setIgnTakenBy] = useState<string | null>(null);

  const [rollStatus, setRollStatus] = useState<"idle" | "too_short" | "checking" | "available" | "taken">("idle");
  const [rollTakenBy, setRollTakenBy] = useState<string | null>(null);

  // Teams available in the chosen campus
  const availableTeams = teams.filter((t) => !campusId || t.campus_id === campusId);

  // Debounced IGN Availability Check (Min 6 Characters)
  useEffect(() => {
    const trimmed = ign.trim();
    if (role !== "STUDENT" || !trimmed) {
      setIgnStatus("idle");
      setIgnTakenBy(null);
      return;
    }

    if (trimmed.length < 6) {
      setIgnStatus("too_short");
      setIgnTakenBy(null);
      return;
    }

    setIgnStatus("checking");
    const timer = setTimeout(async () => {
      const res = await checkIgnAvailabilityAction(trimmed);
      if (res.available) {
        setIgnStatus("available");
        setIgnTakenBy(null);
      } else {
        setIgnStatus("taken");
        setIgnTakenBy(res.takenBy || null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [ign, role]);

  // Debounced Roll Number / Employee ID Availability Check (Min 6 Characters)
  useEffect(() => {
    const trimmed = rollNumber.trim();
    if (!trimmed) {
      setRollStatus("idle");
      setRollTakenBy(null);
      return;
    }

    if (trimmed.length < 6) {
      setRollStatus("too_short");
      setRollTakenBy(null);
      return;
    }

    setRollStatus("checking");
    const timer = setTimeout(async () => {
      const res = await checkRollNumberAvailabilityAction(trimmed);
      if (res.available) {
        setRollStatus("available");
        setRollTakenBy(null);
      } else {
        setRollStatus("taken");
        setRollTakenBy(res.takenBy || null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [rollNumber]);

  // Role options for SearchableSelect
  const roleOptions: SearchableOption[] = [
    {
      value: "STUDENT",
      label: "Student / Esports Player",
      sublabel: "Competes in campus tournaments and scrims",
      icon: <Users className="w-4 h-4 text-cyan-400" />,
    },
    {
      value: "TEACHER",
      label: "Teacher / Faculty Coach",
      sublabel: "Supervises squads and hosts match lobbies",
      icon: <GraduationCap className="w-4 h-4 text-purple-400" />,
    },
    {
      value: "CAMPUS_MANAGER",
      label: "Campus Manager",
      sublabel: "Regional administrator for the campus",
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
    },
  ];

  // Campus options for SearchableSelect
  const campusOptions: SearchableOption[] = [
    {
      value: "",
      label: "Global / Head Office",
      sublabel: "Unassigned to a specific local campus",
      icon: <Building2 className="w-4 h-4 text-white/40" />,
    },
    ...campuses.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: c.region ? `Region: ${c.region}` : undefined,
      avatarUrl: c.logo_url,
      icon: <Building2 className="w-4 h-4 text-white/50" />,
    })),
  ];

  // Team options for SearchableSelect
  const teamOptions: SearchableOption[] = [
    {
      value: "",
      label: "Unassigned (Reserve / Free Agent)",
      sublabel: "Player will not be in an active squad initially",
      icon: <Flame className="w-4 h-4 text-white/30" />,
    },
    ...availableTeams.map((t: any) => ({
      value: t.id,
      label: t.name,
      sublabel: `${t.member_count ?? t.members?.length ?? 0} active players`,
      avatarUrl: t.logo_url,
      icon: <Flame className="w-4 h-4 text-pgc-red" />,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !rollNumber.trim()) return;

    if (rollNumber.trim().length < 6) {
      setError("Roll Number / Employee ID must be at least 6 letters/digits.");
      return;
    }

    if (rollStatus === "taken") {
      setError(`Roll Number / Employee ID '${rollNumber}' is already registered.`);
      return;
    }

    if (role === "STUDENT" && ign.trim()) {
      if (ign.trim().length < 6) {
        setError("In-Game Name (IGN) must be at least 6 letters/digits.");
        return;
      }
      if (ignStatus === "taken") {
        setError(`In-Game Name (IGN) '${ign}' is already taken by another player.`);
        return;
      }
    }

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
      avatar_url: avatarUrl || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setFullName("");
      setEmail("");
      setRollNumber("");
      setIgn("");
      setAvatarUrl(null);
      setIgnStatus("idle");
      setRollStatus("idle");
      setIsCaptain(false);
      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const isSubmitBlocked =
    isLoading ||
    rollNumber.trim().length < 6 ||
    rollStatus === "taken" ||
    rollStatus === "checking" ||
    (role === "STUDENT" &&
      ign.trim().length > 0 &&
      (ign.trim().length < 6 || ignStatus === "taken" || ignStatus === "checking"));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-lg backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] max-h-[90vh] overflow-y-auto overflow-x-hidden p-6">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-emerald/25 to-pgc-emerald/5 border border-pgc-emerald/30 text-pgc-emerald flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <UserPlus className="w-5 h-5 text-pgc-emerald" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
            Add Member
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-sans leading-relaxed">
            Enroll a new student player, assign faculty teacher, or appoint a campus manager.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4.5 mt-3">
          {/* Full Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Full Name
            </label>
            <Input
              placeholder="e.g. Hassan Raza"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-emerald/60 focus-visible:ring-1 focus-visible:ring-pgc-emerald/40"
              autoFocus
            />
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="user@pgc.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-10 bg-black/40 border-white/10 text-white placeholder-white/30 text-xs rounded-xl focus-visible:border-pgc-emerald/60 focus-visible:ring-1 focus-visible:ring-pgc-emerald/40"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
                Temporary Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pl-10 bg-black/40 border-white/10 text-white text-xs rounded-xl focus-visible:border-pgc-emerald/60 focus-visible:ring-1 focus-visible:ring-pgc-emerald/40"
                />
              </div>
            </div>
          </div>

          {/* Role & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
                Account Role
              </label>
              <SearchableSelect
                options={roleOptions}
                value={role}
                onChange={(val) => setRole(val as UserRole)}
                placeholder="Select role..."
                searchPlaceholder="Filter roles..."
                icon={<Shield className="w-4 h-4 text-cyan-400" />}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                  Roll No / Employee ID
                </label>
                {rollStatus === "too_short" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 font-sans">
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span>Min 6 letters ({rollNumber.trim().length}/6)</span>
                  </span>
                )}
                {rollStatus === "checking" && (
                  <span className="flex items-center gap-1 text-[10px] text-white/50 font-sans">
                    <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                    <span>Checking...</span>
                  </span>
                )}
                {rollStatus === "available" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-pgc-emerald font-sans">
                    <Check className="w-3 h-3 text-pgc-emerald" />
                    <span>Available</span>
                  </span>
                )}
                {rollStatus === "taken" && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-pgc-red font-sans">
                    <X className="w-3 h-3 text-pgc-red" />
                    <span>Taken{rollTakenBy ? ` (${rollTakenBy})` : ""}</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="e.g. LHR-2023-01 or MGR-0001"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  className={`h-11 pl-10 pr-9 bg-black/40 border text-white placeholder-white/30 text-xs font-mono rounded-xl transition-colors ${
                    rollStatus === "taken"
                      ? "border-pgc-red/70 focus-visible:border-pgc-red focus-visible:ring-1 focus-visible:ring-pgc-red"
                      : rollStatus === "available"
                      ? "border-pgc-emerald/60 focus-visible:border-pgc-emerald focus-visible:ring-1 focus-visible:ring-pgc-emerald"
                      : rollStatus === "too_short"
                      ? "border-amber-400/50 focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400"
                      : "border-white/10 focus-visible:border-pgc-emerald/60 focus-visible:ring-1 focus-visible:ring-pgc-emerald/40"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {rollStatus === "checking" && <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />}
                  {rollStatus === "available" && <Check className="w-3.5 h-3.5 text-pgc-emerald" />}
                  {rollStatus === "taken" && <X className="w-3.5 h-3.5 text-pgc-red" />}
                </div>
              </div>
            </div>
          </div>

          {/* Campus Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Assigned Campus
            </label>
            <SearchableSelect
              options={campusOptions}
              value={campusId}
              onChange={(val) => {
                setCampusId(val);
                setTeamId("");
              }}
              placeholder="Select campus..."
              searchPlaceholder="Filter campuses..."
              icon={<Building2 className="w-4 h-4" />}
            />
          </div>

          {/* Student-Specific Fields: Team, IGN & Captaincy */}
          {role === "STUDENT" && (
            <div className="space-y-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-pgc-gold" />
                <span className="text-[11px] font-bold text-pgc-gold uppercase tracking-wider font-display">
                  Esports Player Profile
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-400 block font-sans">
                      In-Game Name (IGN)
                    </label>
                    {ignStatus === "too_short" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 font-sans">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>Min 6 letters ({ign.trim().length}/6)</span>
                      </span>
                    )}
                    {ignStatus === "checking" && (
                      <span className="flex items-center gap-1 text-[10px] text-white/50 font-sans">
                        <Loader2 className="w-3 h-3 animate-spin text-pgc-gold" />
                        <span>Checking...</span>
                      </span>
                    )}
                    {ignStatus === "available" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-pgc-emerald font-sans">
                        <Check className="w-3 h-3 text-pgc-emerald" />
                        <span>Available</span>
                      </span>
                    )}
                    {ignStatus === "taken" && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-pgc-red font-sans">
                        <X className="w-3 h-3 text-pgc-red" />
                        <span>Taken{ignTakenBy ? ` (${ignTakenBy})` : ""}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      placeholder="e.g. CyberKhan, ShadowStriker"
                      value={ign}
                      onChange={(e) => setIgn(e.target.value)}
                      className={`h-11 pr-9 bg-black/40 border text-white placeholder-white/30 text-xs font-mono rounded-xl transition-colors ${
                        ignStatus === "taken"
                          ? "border-pgc-red/70 focus-visible:border-pgc-red focus-visible:ring-1 focus-visible:ring-pgc-red"
                          : ignStatus === "available"
                          ? "border-pgc-emerald/60 focus-visible:border-pgc-emerald focus-visible:ring-1 focus-visible:ring-pgc-emerald"
                          : ignStatus === "too_short"
                          ? "border-amber-400/50 focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400"
                          : "border-white/10 focus-visible:border-pgc-gold/60 focus-visible:ring-1 focus-visible:ring-pgc-gold/40"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {ignStatus === "checking" && <Loader2 className="w-3.5 h-3.5 animate-spin text-white/40" />}
                      {ignStatus === "available" && <Check className="w-3.5 h-3.5 text-pgc-emerald" />}
                      {ignStatus === "taken" && <X className="w-3.5 h-3.5 text-pgc-red" />}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 mb-1.5 block font-sans">
                    Assign Squad / Team
                  </label>
                  <SearchableSelect
                    options={teamOptions}
                    value={teamId}
                    onChange={(val) => setTeamId(val)}
                    placeholder="Select team or reserve..."
                    searchPlaceholder="Filter squads..."
                    icon={<Flame className="w-4 h-4 text-pgc-red" />}
                    align="end"
                  />
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
                  <span className="text-xs font-bold text-pgc-gold flex items-center gap-1.5 font-sans">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Designate as Team Captain</span>
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Cloudinary Profile Avatar Upload */}
          <div className="pt-1">
            <CloudinaryUploadZone
              value={avatarUrl}
              onUpload={(url) => setAvatarUrl(url)}
              onRemove={() => setAvatarUrl(null)}
              variant="avatar"
              label="Member Profile Headshot"
              hint="Square (1:1 Aspect Ratio)"
              folder="users/avatars"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-pgc-red/10 border border-pgc-red/30 text-xs text-pgc-red font-sans">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitBlocked}
              className="px-5 py-2.5 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(227,59,41,0.3)] cursor-pointer font-sans"
            >
              {isLoading ? "Adding Member..." : "Add Member"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
