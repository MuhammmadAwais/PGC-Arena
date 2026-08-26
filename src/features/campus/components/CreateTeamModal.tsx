"use client";

import { useState } from "react";
import { Flame, Crown, Building2, Trophy, Users } from "lucide-react";
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
  const [eloRating, setEloRating] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter students by selected campus
  const availableStudents = allStudents.filter(
    (s) => s.role === "STUDENT" && (!campusId || s.campus_id === campusId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !campusId) return;

    setIsLoading(true);
    setError(null);

    const result = await createTeamAction({
      name: name.trim(),
      campus_id: campusId,
      leader_id: leaderId ? leaderId : null,
      elo_rating: Number(eloRating) || 1000,
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
      <DialogContent className="bg-[#0B0C16]/95 border-white/10 text-white max-w-md backdrop-blur-xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/20 text-pgc-gold flex items-center justify-center mb-2">
            <Flame className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">Create Esports Team</DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            Form a new competitive squad for tournament brackets and campus matches.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          {/* Team Name */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
              Team Name
            </label>
            <Input
              placeholder="e.g. Cyber Lions, Shaheen Strikers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white placeholder-white/30"
              autoFocus
            />
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
                  setLeaderId("");
                }}
                required
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-pgc-red/60 cursor-pointer appearance-none"
              >
                {campuses.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0B0C16] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>

          {/* Captain Selector */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 flex items-center justify-between">
              <span>Assign Team Captain</span>
              <span className="text-[10px] text-pgc-gold font-normal">Optional</span>
            </label>
            <div className="relative">
              <select
                value={leaderId}
                onChange={(e) => setLeaderId(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-pgc-gold/60 cursor-pointer appearance-none"
              >
                <option value="" className="bg-[#0B0C16] text-white/60">
                  Select Captain (or assign later)
                </option>
                {availableStudents.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0B0C16] text-white">
                    {s.full_name} {s.ign ? `(#${s.ign})` : ""} - {s.roll_number}
                  </option>
                ))}
              </select>
              <Crown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pgc-gold pointer-events-none" />
            </div>
          </div>

          {/* Initial ELO */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
              Starting ELO Rating
            </label>
            <div className="relative">
              <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                type="number"
                value={eloRating}
                onChange={(e) => setEloRating(Number(e.target.value))}
                min={500}
                max={3000}
                className="pl-9 bg-black/40 border-white/10 text-white"
              />
            </div>
          </div>

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
              {isLoading ? "Creating Team..." : "Create Team"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
