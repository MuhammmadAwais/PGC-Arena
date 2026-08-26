"use client";

import { useState } from "react";
import { Building2, Plus, X, MapPin } from "lucide-react";
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
      <DialogContent className="bg-[#0B0C16]/95 border-white/10 text-white max-w-md backdrop-blur-xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-pgc-red/20 text-pgc-red flex items-center justify-center mb-2">
            <Building2 className="w-5 h-5" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold">Create Campus</DialogTitle>
          <DialogDescription className="text-white/50 text-xs">
            Add an institutional Punjab Group of Colleges campus to organize teams and faculty.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
              Campus Name
            </label>
            <Input
              placeholder="e.g. PGC Alpha Campus"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white placeholder-white/30"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-1.5 block">
              Region / City
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="e.g. Lahore Central, Islamabad North"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="pl-9 bg-black/40 border-white/10 text-white placeholder-white/30"
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
              {isLoading ? "Creating..." : "Create Campus"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
