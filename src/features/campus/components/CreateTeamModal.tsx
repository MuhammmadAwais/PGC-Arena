"use client";

import { useState } from "react";
import { Flame, Crown, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createTeamAction } from "../actions/campusActions";
import type { CampusItem, MemberItem } from "../types/campusTypes";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";

interface CreateTeamModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campuses: CampusItem[];
  allStudents: MemberItem[];
  defaultCampusId?: string | null;
  onSuccess?: () => void;
}

export function CreateTeamModal({
  isOpen,
  onOpenChange,
  campuses,
  allStudents,
  defaultCampusId,
  onSuccess,
}: CreateTeamModalProps) {
  const [name, setName] = useState("");
  const [campusId, setCampusId] = useState(defaultCampusId || (campuses[0]?.id ?? ""));
  const [leaderId, setLeaderId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter students by selected campus
  const availableStudents = allStudents.filter(
    (s) => s.role === "STUDENT" && (!campusId || s.campus_id === campusId)
  );

  // Format Campus options for SearchableSelect
  const campusOptions: SearchableOption[] = campuses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.region ? `Region: ${c.region}` : undefined,
    avatarUrl: c.logo_url,
    icon: <Building2 className="w-4 h-4 text-white/50" />,
  }));

  // Format Captain options for SearchableSelect
  const captainOptions: SearchableOption[] = [
    {
      value: "",
      label: "Select Captain (or assign later)",
      sublabel: "Squad will start without an appointed captain",
      icon: <Crown className="w-4 h-4 text-white/30" />,
    },
    ...availableStudents.map((s) => ({
      value: s.id,
      label: s.full_name,
      sublabel: s.roll_number ? `Roll: ${s.roll_number}` : undefined,
      badge: s.ign ? `#${s.ign}` : undefined,
      avatarUrl: s.avatar_url,
      icon: <Crown className="w-4 h-4 text-pgc-gold" />,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !campusId) return;

    setIsLoading(true);
    setError(null);

    // Initial ELO rating is strictly hardcoded to 0
    const result = await createTeamAction({
      name: name.trim(),
      campus_id: campusId,
      leader_id: leaderId ? leaderId : null,
      elo_rating: 0,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setName("");
      setLeaderId("");
      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-md backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-gold/25 to-pgc-gold/5 border border-pgc-gold/30 text-pgc-gold flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Flame className="w-5 h-5 text-pgc-gold" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
            Create Esports Team
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-sans leading-relaxed">
            Form a new competitive squad for tournament brackets, scrims, and campus matches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4.5 mt-3">
          {/* Team Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Team Name
            </label>
            <Input
              placeholder="e.g. Cyber Lions, Shaheen Strikers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-gold/60 focus-visible:ring-1 focus-visible:ring-pgc-gold/40"
              autoFocus
            />
          </div>

          {/* Searchable Campus Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Assigned Campus
            </label>
            <SearchableSelect
              options={campusOptions}
              value={campusId}
              onChange={(val) => {
                setCampusId(val);
                setLeaderId("");
              }}
              placeholder="Search or select campus..."
              searchPlaceholder="Filter campuses..."
              icon={<Building2 className="w-4 h-4" />}
            />
          </div>

          {/* Searchable Captain Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between font-sans">
              <span>Assign Team Captain</span>
              <span className="text-[10px] text-pgc-gold font-semibold uppercase tracking-wider">Optional</span>
            </label>
            <SearchableSelect
              options={captainOptions}
              value={leaderId}
              onChange={(val) => setLeaderId(val)}
              placeholder="Search student or assign later..."
              searchPlaceholder="Search by student name, IGN or roll #..."
              icon={<Crown className="w-4 h-4 text-pgc-gold" />}
              allowClear
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
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(227,59,41,0.3)] cursor-pointer font-sans"
            >
              {isLoading ? "Creating Team..." : "Create Team"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
