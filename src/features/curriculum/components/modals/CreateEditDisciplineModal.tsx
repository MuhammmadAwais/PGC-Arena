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
      <DialogContent className="max-w-xl w-[95vw] p-6 sm:p-7 bg-[#0e111d] border border-white/[0.08] text-white backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {/* ── Dialog Header ───────────────────────────────────────── */}
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Discipline" : "Create Discipline"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {isEditing
                  ? "Update discipline name, code, and active status."
                  : "Add an academic discipline (e.g., ICS, FSc Pre-Medical, I.Com)."}
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* ── Discipline Name & Code ──────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
                Discipline Name <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ICS (Computer Science)"
                required
                className="bg-black/40 border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
                Code <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ICS"
                required
                className="bg-black/40 border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs font-mono font-bold uppercase rounded-xl px-3.5 py-2.5 focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 transition-all"
              />
            </div>
          </div>

          {/* ── Description / Specialization Note ───────────────────── */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Intermediate stream with Mathematics and Computer Science emphasis."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/20 resize-none font-sans leading-relaxed transition-all"
            />
          </div>

          {/* ── Active Status Card (Professional & Minimal) ─────────── */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white font-display">Status</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isActive
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Available to map across boards and arena matches.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* ── Discipline Badge / Emblem ───────────────────────────── */}
          <div className="space-y-1.5 pt-1">
            <CloudinaryUploadZone
              label="Discipline Icon / Emblem"
              variant="avatar"
              value={logoUrl}
              onUpload={setLogoUrl}
              onRemove={() => setLogoUrl(null)}
              folder="disciplines/emblems"
            />
          </div>

          {/* ── Modal Footer Actions ────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={closeCreateDiscipline}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-pgc-red hover:bg-[#c92f1f] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/25 hover:shadow-pgc-red/40 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
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
