"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  Mail,
  Lock,
  Building2,
  Flame,
  Crown,
  Hash,
  Check,
  X,
  Loader2,
  AlertCircle,
  Gamepad2,
  User,
  ShieldAlert,
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
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";
import { CloudinaryUploadZone } from "@/components/ui/CloudinaryUploadZone";

interface AddStudentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campuses: { id: string; name: string; region?: string | null; logo_url?: string | null }[];
  teams: { id: string; name: string; campus_id: string; logo_url?: string | null; members?: any[]; member_count?: number }[];
  defaultCampusId?: string | null;
  defaultTeamId?: string | null;
  onSuccess?: () => void;
}

export function AddStudentModal({
  isOpen,
  onOpenChange,
  campuses,
  teams,
  defaultCampusId,
  defaultTeamId,
  onSuccess,
}: AddStudentModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("PgcArena123!");
  const [rollNumber, setRollNumber] = useState("");
  const [campusId, setCampusId] = useState(defaultCampusId || (campuses[0]?.id ?? ""));
  const [teamId, setTeamId] = useState(defaultTeamId || "");
  const [ign, setIgn] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isCaptain, setIsCaptain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dynamic Real-time Availability States
  const [ignStatus, setIgnStatus] = useState<"idle" | "too_short" | "checking" | "available" | "taken">("idle");
  const [ignTakenBy, setIgnTakenBy] = useState<string | null>(null);

  const [rollStatus, setRollStatus] = useState<"idle" | "too_short" | "checking" | "available" | "taken">("idle");
  const [rollTakenBy, setRollTakenBy] = useState<string | null>(null);

  // Sync default campus and team when modal opens or defaults change
  useEffect(() => {
    if (defaultCampusId) setCampusId(defaultCampusId);
    if (defaultTeamId) setTeamId(defaultTeamId);
  }, [defaultCampusId, defaultTeamId, isOpen]);

  // Auto-generate suggested institutional email from roll number if empty
  useEffect(() => {
    if (rollNumber.trim() && (!email || email.includes("@pgc.edu"))) {
      const cleanRoll = rollNumber.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (cleanRoll) {
        setEmail(`${cleanRoll}@pgc.edu`);
      }
    }
  }, [rollNumber]);

  // Teams strictly filtered to the chosen campus
  const availableTeams = teams.filter((t) => !campusId || t.campus_id === campusId);

  // Debounced IGN Availability Check (Min 6 Characters)
  useEffect(() => {
    const trimmed = ign.trim();
    if (!trimmed) {
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
    }, 400);

    return () => clearTimeout(timer);
  }, [ign]);

  // Debounced Roll Number Availability Check (Min 6 Characters)
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
    }, 400);

    return () => clearTimeout(timer);
  }, [rollNumber]);

  // Campus options for SearchableSelect
  const campusOptions: SearchableOption[] = campuses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.region ? `Region: ${c.region}` : undefined,
    avatarUrl: c.logo_url,
    icon: <Building2 className="w-4 h-4 text-cyan-400" />,
  }));

  // Team options for SearchableSelect (Strictly within selected campus)
  const teamOptions: SearchableOption[] = [
    {
      value: "",
      label: "Unassigned (Reserve / Free Agent)",
      sublabel: "Player will not be locked into an active squad",
      icon: <Flame className="w-4 h-4 text-white/30" />,
    },
    ...availableTeams.map((t: any) => ({
      value: t.id,
      label: t.name,
      sublabel: `${t.member_count ?? t.members?.length ?? 0} active squad players`,
      avatarUrl: t.logo_url,
      icon: <Flame className="w-4 h-4 text-pgc-red" />,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !rollNumber.trim()) return;

    if (rollNumber.trim().length < 6) {
      setError("Roll Number / Student ID must be at least 6 letters/digits.");
      return;
    }

    if (rollStatus === "taken") {
      setError(`Roll Number '${rollNumber}' is already registered.`);
      return;
    }

    if (ign.trim() && ign.trim().length < 6) {
      setError("In-Game Name (IGN) must be at least 6 letters/digits.");
      return;
    }

    if (ignStatus === "taken") {
      setError(`IGN Gamer Tag '#${ign}' is already taken.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await addMemberAction({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: "STUDENT",
        rollNumber: rollNumber.trim().toUpperCase(),
        campusId: campusId || undefined,
        teamId: teamId || undefined,
        ign: ign.trim() ? ign.trim().toUpperCase() : undefined,
        isCaptain: isCaptain && Boolean(teamId),
        avatarUrl: avatarUrl || undefined,
      });

      if (res.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        onOpenChange(false);
        // Reset form
        setFullName("");
        setEmail("");
        setRollNumber("");
        setIgn("");
        setAvatarUrl(null);
        setIsCaptain(false);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err.message || "Failed to enroll student.");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden custom-scrollbar backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 font-sans">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-red/25 to-pgc-red/5 border border-pgc-red/30 text-pgc-red flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(227,59,41,0.2)]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Enroll Student Player</span>
            <span className="px-2.5 py-0.5 rounded-full bg-pgc-red/15 border border-pgc-red/30 text-pgc-red text-[10px] font-mono font-bold uppercase tracking-wider">
              Student Account
            </span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Register and enroll a new student player directly into this campus branch &amp; squad roster.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {error && (
            <div className="p-3 rounded-xl bg-pgc-red/10 border border-pgc-red/30 text-xs text-pgc-red font-sans flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Full Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
              Student Full Name *
            </label>
            <Input
              placeholder="e.g. Hassan Raza"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-red focus-visible:ring-1 focus-visible:ring-pgc-red/40"
            />
          </div>

          {/* Roll Number & IGN Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Roll Number */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                  Roll Number *
                </label>
                {rollStatus === "checking" && (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> checking...
                  </span>
                )}
                {rollStatus === "available" && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
                    <Check className="w-2.5 h-2.5" /> Available
                  </span>
                )}
                {rollStatus === "taken" && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono font-bold">
                    <X className="w-2.5 h-2.5" /> Taken
                  </span>
                )}
                {rollStatus === "too_short" && (
                  <span className="text-[10px] text-amber-400/80 font-mono">Min 6 chars</span>
                )}
              </div>
              <Input
                placeholder="e.g. LHR-2024-CS01"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                required
                className={`h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl uppercase font-mono text-xs focus-visible:ring-1 ${
                  rollStatus === "available"
                    ? "border-emerald-500/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/40"
                    : rollStatus === "taken"
                    ? "border-red-500/50 focus-visible:border-red-400 focus-visible:ring-red-400/40"
                    : "focus-visible:border-pgc-red focus-visible:ring-pgc-red/40"
                }`}
              />
            </div>

            {/* IGN Gamer Tag */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                  In-Game Name (IGN)
                </label>
                {ignStatus === "checking" && (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" /> checking...
                  </span>
                )}
                {ignStatus === "available" && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono font-bold">
                    <Check className="w-2.5 h-2.5" /> Available
                  </span>
                )}
                {ignStatus === "taken" && (
                  <span className="text-[10px] text-red-400 flex items-center gap-1 font-mono font-bold">
                    <X className="w-2.5 h-2.5" /> Taken
                  </span>
                )}
                {ignStatus === "too_short" && (
                  <span className="text-[10px] text-amber-400/80 font-mono">Min 6 chars</span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pgc-gold font-mono font-bold text-xs">
                  #
                </span>
                <Input
                  placeholder="CYBERKHAN"
                  value={ign}
                  onChange={(e) => setIgn(e.target.value.toUpperCase().replace(/\s+/g, ""))}
                  className={`h-11 pl-8 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl uppercase font-mono font-bold text-xs focus-visible:ring-1 ${
                    ignStatus === "available"
                      ? "border-emerald-500/50 focus-visible:border-emerald-400 focus-visible:ring-emerald-400/40"
                      : ignStatus === "taken"
                      ? "border-red-500/50 focus-visible:border-red-400 focus-visible:ring-red-400/40"
                      : "focus-visible:border-pgc-gold focus-visible:ring-pgc-gold/40"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Email Address & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
                Student Email *
              </label>
              <Input
                type="email"
                placeholder="student@pgc.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl text-xs focus-visible:border-cyan-400 focus-visible:ring-1 focus-visible:ring-cyan-400/40"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
                Temporary Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl text-xs focus-visible:border-amber-400 focus-visible:ring-1 focus-visible:ring-amber-400/40"
              />
            </div>
          </div>

          {/* Campus Branch Picker (Full Width) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between font-display">
              <span>Campus Branch *</span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Affiliation</span>
            </label>
            <SearchableSelect
              options={campusOptions}
              value={campusId}
              onChange={(val) => {
                setCampusId(val);
                setTeamId(""); // Reset squad when campus changes
              }}
              placeholder="Select campus branch..."
              searchPlaceholder="Search campus by name..."
              icon={<Building2 className="w-4 h-4 text-cyan-400" />}
            />
          </div>

          {/* Assign Squad / Team Picker (Full Width) */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between font-display">
              <span>Assign Squad / Team</span>
              <span className="text-[10px] text-pgc-red font-semibold uppercase tracking-wider">Esports Roster</span>
            </label>
            <SearchableSelect
              options={teamOptions}
              value={teamId}
              onChange={setTeamId}
              placeholder="Unassigned (Reserve / Free Agent)"
              searchPlaceholder="Search squad by name..."
              icon={<Flame className="w-4 h-4 text-pgc-red" />}
              allowClear
            />
          </div>

          {/* Captaincy Option (if squad selected) */}
          {teamId && (
            <div className="p-3.5 rounded-xl bg-pgc-gold/10 border border-pgc-gold/30 flex items-center justify-between transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pgc-gold/20 flex items-center justify-center text-pgc-gold shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Appoint as Squad Captain</p>
                  <p className="text-[11px] text-slate-400">Designate this player as team leader</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isCaptain}
                onChange={(e) => setIsCaptain(e.target.checked)}
                className="w-5 h-5 accent-pgc-gold rounded cursor-pointer"
              />
            </div>
          )}

          {/* Cloudinary Avatar Upload Zone */}
          <div className="pt-1">
            <CloudinaryUploadZone
              value={avatarUrl}
              onUpload={(url) => setAvatarUrl(url)}
              onRemove={() => setAvatarUrl(null)}
              variant="avatar"
              label="Student Portrait / Avatar Image"
              hint="Square (1:1 Aspect Ratio)"
              folder="students/avatars"
            />
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || rollStatus === "taken" || ignStatus === "taken"}
              className="px-5 py-2.5 rounded-xl bg-pgc-red hover:bg-pgc-hover text-white text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(227,59,41,0.3)] cursor-pointer flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Enrolling Player...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-4 h-4" />
                  <span>Enroll Student</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
