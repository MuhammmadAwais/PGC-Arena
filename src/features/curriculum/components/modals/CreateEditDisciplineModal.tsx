"use client";

import { useState, useEffect } from "react";
import { Layers, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { CloudinaryUploadZone } from "@/components/ui/CloudinaryUploadZone";
import { useCurriculumStore } from "../../store/useCurriculumStore";
import {
  createDisciplineAction,
  updateDisciplineAction,
} from "../../actions/curriculumActions";

export function CreateEditDisciplineModal() {
  const {
    isCreateDisciplineOpen,
    closeCreateDiscipline,
    editDisciplineData,
    fetchCurriculum,
  } = useCurriculumStore();

  const isEditing = !!editDisciplineData;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editDisciplineData) {
      setName(editDisciplineData.name);
      setCode(editDisciplineData.code);
      setDescription(editDisciplineData.description || "");
      setLogoUrl(editDisciplineData.logo_url);
      setIsActive(editDisciplineData.is_active);
    } else {
      setName("");
      setCode("");
      setDescription("");
      setLogoUrl(null);
      setIsActive(true);
    }
    setError(null);
  }, [editDisciplineData, isCreateDisciplineOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Discipline name and code are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editDisciplineData) {
        const res = await updateDisciplineAction({
          id: editDisciplineData.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          logo_url: logoUrl,
          is_active: isActive,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to update discipline");
        }
      } else {
        const res = await createDisciplineAction({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          logo_url: logoUrl,
          is_active: isActive,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to create discipline");
        }
      }

      await fetchCurriculum(true);
      closeCreateDiscipline();
    } catch (err: any) {
      console.error("Discipline modal submission error:", err);
      setError(err.message || "Failed to save discipline");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateDisciplineOpen} onOpenChange={(open) => !open && closeCreateDiscipline()}>
      <DialogContent className="max-w-md p-6 bg-[#0B0C16]/95 border-white/15 text-white backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Academic Discipline" : "Create Academic Discipline"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {isEditing
                  ? "Modify discipline parameters and track info."
                  : "Define a major academic stream (e.g. ICS, FSc Pre-Med, I.Com)."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Discipline Name <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ICS (Computer Science)"
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs focus:border-amber-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Code <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ICS-PHY"
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs font-mono uppercase focus:border-amber-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
              Description / Specialization Note
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Intermediate with Mathematics and Physics emphasis."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
            <div>
              <p className="text-xs font-bold text-white font-display">Active Discipline</p>
              <p className="text-[11px] text-slate-400">
                Visible for subject mapping and match creation.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <CloudinaryUploadZone
            label="Discipline Badge / Emblem"
            variant="avatar"
            value={logoUrl}
            onUpload={setLogoUrl}
            onRemove={() => setLogoUrl(null)}
            folder="disciplines/emblems"
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeCreateDiscipline}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Save Changes" : "Create Discipline"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
