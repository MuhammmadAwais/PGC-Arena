"use client";

import { useState } from "react";
import { Building2, Plus, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createCampusAction } from "../actions/campusActions";

interface CreateCampusModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCampusModal({
  isOpen,
  onOpenChange,
  onSuccess,
}: CreateCampusModalProps) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await createCampusAction({
      name: name.trim(),
      region: region.trim() || undefined,
    });

    if (result.error) {
      setError(result.error);
      setIsLoading(false);
    } else {
      setName("");
      setRegion("");
      setIsLoading(false);
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-md backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-red/25 to-pgc-red/5 border border-pgc-red/30 text-pgc-red flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(227,59,41,0.2)]">
            <Building2 className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white">
            Create Campus
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-sans leading-relaxed">
            Add an institutional Punjab Group of Colleges campus to organize competitive squads, faculty leads, and students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4.5 mt-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Campus Name
            </label>
            <Input
              placeholder="e.g. PGC Alpha Campus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="h-11 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-red/60 focus-visible:ring-1 focus-visible:ring-pgc-red/40"
              autoFocus
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Region / City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="e.g. Lahore Central, Islamabad North"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="h-11 pl-10 bg-black/40 border-white/10 text-white placeholder-white/30 rounded-xl focus-visible:border-pgc-red/60 focus-visible:ring-1 focus-visible:ring-pgc-red/40"
              />
            </div>
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
              {isLoading ? "Creating..." : "Create Campus"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
