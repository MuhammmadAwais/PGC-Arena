"use client";

import { useState } from "react";
import { UserPlus, Flame, Building2, Search, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  assignStudentToCampusAction,
  assignStudentToTeamAction,
} from "../actions/campusActions";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";

interface AssignStudentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "campus" | "team";
  targetId: string;
  targetName: string;
  availableStudents: {
    id: string;
    full_name: string;
    email?: string;
    roll_number: string;
    ign?: string | null;
    avatar_url?: string | null;
    campus_id?: string | null;
    team_id?: string | null;
    campus_name?: string;
    team_name?: string;
  }[];
  onSuccess?: () => void;
}

export function AssignStudentModal({
  isOpen,
  onOpenChange,
  targetType,
  targetId,
  targetName,
  availableStudents,
  onSuccess,
}: AssignStudentModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out students who are already in this target
  const eligibleStudents = availableStudents.filter((s) => {
    if (targetType === "campus") {
      return s.campus_id !== targetId;
    }
    return s.team_id !== targetId;
  });

  const studentOptions: SearchableOption[] = eligibleStudents.map((s) => {
    let sublabel = `Roll: ${s.roll_number}`;
    if (s.campus_name) sublabel += ` • ${s.campus_name}`;
    if (s.team_name) sublabel += ` • Squad: ${s.team_name}`;

    return {
      value: s.id,
      label: s.full_name,
      sublabel,
      badge: s.ign ? `#${s.ign}` : undefined,
      avatarUrl: s.avatar_url,
      icon: <UserPlus className="w-4 h-4 text-cyan-400" />,
    };
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;

    setIsLoading(true);
    setError(null);

    let res;
    if (targetType === "campus") {
      res = await assignStudentToCampusAction(selectedStudentId, targetId);
    } else {
      res = await assignStudentToTeamAction(selectedStudentId, targetId);
    }

    if (res.error) {
      setError(res.error);
      setIsLoading(false);
    } else {
      setSelectedStudentId("");
      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-md backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 font-sans">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/25 to-cyan-500/5 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            {targetType === "campus" ? (
              <Building2 className="w-5 h-5" />
            ) : (
              <Flame className="w-5 h-5 text-pgc-red" />
            )}
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
            {targetType === "campus" ? "Enroll Student to Campus" : "Draft Player to Squad"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            {targetType === "campus"
              ? `Select an existing student player from the institutional directory to affiliate with ${targetName}.`
              : `Draft an eligible student player directly into ${targetName}'s active competitive roster.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAssign} className="space-y-4.5 mt-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
              Select Student Player *
            </label>
            <SearchableSelect
              options={studentOptions}
              value={selectedStudentId}
              onChange={(val) => setSelectedStudentId(val)}
              placeholder="Search by student name, roll # or IGN..."
              searchPlaceholder="Filter candidate players..."
              icon={<UserPlus className="w-4 h-4 text-cyan-400" />}
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Showing {eligibleStudents.length} available students across campuses.
            </p>
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
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !selectedStudentId}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              {isLoading ? "Assigning..." : "Assign Player"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
