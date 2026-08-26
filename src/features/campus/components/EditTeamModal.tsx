"use client";

import { useState, useEffect } from "react";
import { Flame, Crown, Building2, Edit3, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateTeamAction } from "../actions/campusActions";
import { CloudinaryUploadZone } from "@/components/ui/CloudinaryUploadZone";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";

interface EditTeamModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  team: {
    id: string;
    name: string;
    campus_id: string;
    leader_id?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  };
  campuses: {
    id: string;
    name: string;
    region?: string | null;
    logo_url?: string | null;
  }[];
  availableStudents?: {
    id: string;
    full_name: string;
    email?: string;
    roll_number?: string;
    ign?: string | null;
    avatar_url?: string | null;
    campus_id?: string | null;
  }[];
  onSuccess?: () => void;
}

export function EditTeamModal({
  isOpen,
  onOpenChange,
  team,
  campuses,
  availableStudents = [],
  onSuccess,
}: EditTeamModalProps) {
  const [name, setName] = useState(team.name || "");
  const [campusId, setCampusId] = useState(team.campus_id || "");
  const [leaderId, setLeaderId] = useState<string>(team.leader_id || "");
  const [logoUrl, setLogoUrl] = useState<string | null>(team.logo_url || null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(team.banner_url || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or team prop changes
  useEffect(() => {
    setName(team.name || "");
    setCampusId(team.campus_id || "");
    setLeaderId(team.leader_id || "");
    setLogoUrl(team.logo_url || null);
    setBannerUrl(team.banner_url || null);
    setError(null);
  }, [team, isOpen]);

  // Campus options for SearchableSelect
  const campusOptions: SearchableOption[] = campuses.map((c) => ({
    value: c.id,
    label: c.name,
    sublabel: c.region ? `Region: ${c.region}` : undefined,
    avatarUrl: c.logo_url,
    icon: <Building2 className="w-4 h-4 text-white/50" />,
  }));

  // Students eligible for captaincy in this campus or overall
  const campusStudents = availableStudents.filter(
    (s) => !campusId || s.campus_id === campusId
  );

  const captainOptions: SearchableOption[] = [
    {
      value: "",
      label: "Unassigned (No Captain)",
      sublabel: "Leave squad leadership vacant",
      icon: <Crown className="w-4 h-4 text-white/30" />,
    },
    ...campusStudents.map((s) => ({
      value: s.id,
      label: s.full_name,
      sublabel: s.roll_number ? `Roll: ${s.roll_number}` : s.email,
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

    const result = await updateTeamAction(team.id, {
      name: name.trim(),
      campus_id: campusId,
      leader_id: leaderId ? leaderId : null,
      logo_url: logoUrl,
      banner_url: bannerUrl,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 font-sans">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-gold/25 to-pgc-gold/5 border border-pgc-gold/30 text-pgc-gold flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Edit3 className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
            Edit Esports Squad
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Update team name, affiliated campus branch, squad crest emblem, banner, and appoint or replace the team captain.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4.5 mt-3">
          {/* Team Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
              Team Name *
            </label>
            <Input
              placeholder="e.g. Cyber Lions, Shaheen Strikers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-gold/60 focus-visible:ring-1 focus-visible:ring-pgc-gold/40"
            />
          </div>

          {/* Searchable Campus Selector */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
              Assigned Campus Branch *
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
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between font-display">
              <span>Appoint Team Captain</span>
              <span className="text-[10px] text-pgc-gold font-semibold uppercase tracking-wider">Leadership</span>
            </label>
            <SearchableSelect
              options={captainOptions}
              value={leaderId}
              onChange={(val) => setLeaderId(val)}
              placeholder="Select captain or unassign..."
              searchPlaceholder="Search student by name, IGN or roll #..."
              icon={<Crown className="w-4 h-4 text-pgc-gold" />}
              allowClear
            />
          </div>

          {/* Cloudinary Media Uploads Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <CloudinaryUploadZone
              value={logoUrl}
              onUpload={(url) => setLogoUrl(url)}
              onRemove={() => setLogoUrl(null)}
              variant="avatar"
              label="Squad Crest Emblem"
              hint="Square (1:1 Aspect Ratio)"
              folder="teams/crests"
            />

            <CloudinaryUploadZone
              value={bannerUrl}
              onUpload={(url) => setBannerUrl(url)}
              onRemove={() => setBannerUrl(null)}
              variant="banner"
              label="Squad Tournament Banner"
              hint="Panoramic (16:9 / 3:1)"
              folder="teams/banners"
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
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-pgc-gold hover:bg-amber-400 text-black text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              {isLoading ? "Saving Squad..." : "Save Squad Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
