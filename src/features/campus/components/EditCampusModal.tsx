"use client";

import { useState, useEffect } from "react";
import { Building2, MapPin, Shield, Edit3, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateCampusAction } from "../actions/campusActions";
import { CloudinaryUploadZone } from "@/components/ui/CloudinaryUploadZone";
import { SearchableSelect, type SearchableOption } from "@/components/ui/searchable-select";

interface EditCampusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campus: {
    id: string;
    name: string;
    region?: string | null;
    logo_url?: string | null;
    banner_url?: string | null;
  };
  currentManagerId?: string | null;
  availableManagers?: {
    id: string;
    full_name: string;
    email?: string;
    roll_number?: string;
    avatar_url?: string | null;
  }[];
  onSuccess?: () => void;
}

export function EditCampusModal({
  isOpen,
  onOpenChange,
  campus,
  currentManagerId,
  availableManagers = [],
  onSuccess,
}: EditCampusModalProps) {
  const [name, setName] = useState(campus.name || "");
  const [region, setRegion] = useState(campus.region || "");
  const [logoUrl, setLogoUrl] = useState<string | null>(campus.logo_url || null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(campus.banner_url || null);
  const [managerId, setManagerId] = useState<string>(currentManagerId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever modal opens or campus prop changes
  useEffect(() => {
    setName(campus.name || "");
    setRegion(campus.region || "");
    setLogoUrl(campus.logo_url || null);
    setBannerUrl(campus.banner_url || null);
    setManagerId(currentManagerId || "");
    setError(null);
  }, [campus, currentManagerId, isOpen]);

  // Manager options for SearchableSelect
  const managerOptions: SearchableOption[] = [
    {
      value: "",
      label: "Unassigned (No Manager)",
      sublabel: "Leave regional leadership vacant",
      icon: <Shield className="w-4 h-4 text-white/30" />,
    },
    ...availableManagers.map((m) => ({
      value: m.id,
      label: m.full_name,
      sublabel: m.roll_number ? `ID: ${m.roll_number}` : m.email,
      avatarUrl: m.avatar_url,
      icon: <Shield className="w-4 h-4 text-cyan-400" />,
    })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await updateCampusAction(campus.id, {
      name: name.trim(),
      region: region.trim() || undefined,
      logo_url: logoUrl,
      banner_url: bannerUrl,
      manager_id: managerId ? managerId : null,
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
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/25 to-cyan-500/5 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Edit3 className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
            Edit Campus Details
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs leading-relaxed">
            Update campus name, regional location, branding media, and appoint or replace the campus manager.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4.5 mt-3">
          {/* Campus Name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
              Campus Name *
            </label>
            <Input
              placeholder="e.g. PGC Alpha Campus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-cyan-400 focus-visible:ring-1 focus-visible:ring-cyan-400/40"
            />
          </div>

          {/* Region / Location */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-display">
              Region / City Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="e.g. Lahore Central, Islamabad North"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-11 pl-10 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-cyan-400 focus-visible:ring-1 focus-visible:ring-cyan-400/40"
              />
            </div>
          </div>

          {/* Appoint / Change Campus Manager */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between font-display">
              <span>Appointed Campus Manager</span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider">Leadership</span>
            </label>
            <SearchableSelect
              options={managerOptions}
              value={managerId}
              onChange={(val) => setManagerId(val)}
              placeholder="Select manager or unassign..."
              searchPlaceholder="Search manager by name or ID..."
              icon={<Shield className="w-4 h-4 text-cyan-400" />}
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
              label="Campus Emblem Logo"
              hint="Square (1:1 Aspect Ratio)"
              folder="campuses/logos"
            />

            <CloudinaryUploadZone
              value={bannerUrl}
              onUpload={(url) => setBannerUrl(url)}
              onRemove={() => setBannerUrl(null)}
              variant="banner"
              label="Campus Master Banner"
              hint="Panoramic (16:9 / 3:1)"
              folder="campuses/banners"
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
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer"
            >
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
