"use client";

import { useState, useEffect } from "react";
import {
  BookMarked,
  Loader2,
  AlertCircle,
  Languages,
  Globe,
  Check,
} from "lucide-react";
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
  createSubjectAction,
  updateSubjectAction,
} from "../../actions/curriculumActions";
import type { ScriptType } from "../../types/curriculumTypes";

export function CreateEditSubjectModal() {
  const {
    isCreateSubjectOpen,
    closeCreateSubject,
    editSubjectData,
    fetchCurriculum,
  } = useCurriculumStore();

  const isEditing = !!editSubjectData;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [scriptType, setScriptType] = useState<ScriptType>("LATIN");
  const [textbookCoverUrl, setTextbookCoverUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editSubjectData) {
      setName(editSubjectData.name);
      setCode(editSubjectData.code);
      setScriptType(editSubjectData.script_type);
      setTextbookCoverUrl(editSubjectData.textbook_cover_url);
      setDescription(editSubjectData.description || "");
      setIsActive(editSubjectData.is_active);
    } else {
      setName("");
      setCode("");
      setScriptType("LATIN");
      setTextbookCoverUrl(null);
      setDescription("");
      setIsActive(true);
    }
    setError(null);
  }, [editSubjectData, isCreateSubjectOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Subject name and code are required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editSubjectData) {
        const res = await updateSubjectAction({
          id: editSubjectData.id,
          name: name.trim(),
          code: code.trim().toUpperCase(),
          script_type: scriptType,
          textbook_cover_url: textbookCoverUrl,
          description: description.trim() || null,
          is_active: isActive,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to update subject");
        }
      } else {
        const res = await createSubjectAction({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          script_type: scriptType,
          textbook_cover_url: textbookCoverUrl,
          description: description.trim() || null,
          is_active: isActive,
        });

        if (!res.success) {
          throw new Error(res.error || "Failed to create subject");
        }
      }

      await fetchCurriculum(true);
      closeCreateSubject();
    } catch (err: any) {
      console.error("Subject modal submission error:", err);
      setError(err.message || "Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateSubjectOpen} onOpenChange={(open) => !open && closeCreateSubject()}>
      <DialogContent className="max-w-xl w-[95vw] p-6 sm:p-7 bg-[#0e111d] border border-white/[0.08] text-white backdrop-blur-2xl rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        {/* ── Dialog Header ───────────────────────────────────────── */}
        <DialogHeader className="border-b border-white/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <BookMarked className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Subject" : "Create Subject"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {isEditing
                  ? "Update subject details, script typography, or cover image."
                  : "Add a subject to your curriculum catalog (e.g., Physics, Computer Science)."}
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
          {/* ── Subject Name & Code ─────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
                Subject Name <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  scriptType === "URDU_NASTALIQ"
                    ? "اردو ادب و قواعد"
                    : scriptType === "ARABIC"
                    ? "القرآن الكريم و اسلامیات"
                    : "e.g. Computer Science"
                }
                required
                className={`bg-black/40 border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs rounded-xl px-3.5 py-2.5 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all ${
                  scriptType === "URDU_NASTALIQ"
                    ? "font-urdu-nastaliq text-right leading-loose"
                    : scriptType === "ARABIC"
                    ? "font-arabic text-right leading-loose"
                    : "font-sans"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
                Code <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CS"
                required
                className="bg-black/40 border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs font-mono font-bold uppercase rounded-xl px-3.5 py-2.5 focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 transition-all"
              />
            </div>
          </div>

          {/* ── Multi-Script Engine & Typography Selector ───────────── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span>Language &amp; Typography</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Font preset
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Latin (En) */}
              <button
                type="button"
                onClick={() => setScriptType("LATIN")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                  scriptType === "LATIN"
                    ? "bg-cyan-500/10 border-cyan-400/60 text-white shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400/30"
                    : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-display text-white">Latin (En)</span>
                  {scriptType === "LATIN" ? (
                    <div className="h-4 w-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-sans">English &amp; Science</p>
              </button>

              {/* Urdu Nastaliq */}
              <button
                type="button"
                onClick={() => setScriptType("URDU_NASTALIQ")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                  scriptType === "URDU_NASTALIQ"
                    ? "bg-emerald-500/10 border-emerald-400/60 text-white shadow-md shadow-emerald-500/15 ring-1 ring-emerald-400/30"
                    : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-urdu-sans text-white">اردو نستعلیق</span>
                  {scriptType === "URDU_NASTALIQ" ? (
                    <div className="h-4 w-4 rounded-full bg-emerald-400 text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-400">Urdu</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 font-urdu-nastaliq leading-relaxed">ادبیات اور گرامر</p>
              </button>

              {/* Arabic / Quran */}
              <button
                type="button"
                onClick={() => setScriptType("ARABIC")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden backdrop-blur-md ${
                  scriptType === "ARABIC"
                    ? "bg-amber-500/10 border-amber-400/60 text-white shadow-md shadow-amber-500/15 ring-1 ring-amber-400/30"
                    : "bg-white/[0.02] border-white/[0.08] text-slate-400 hover:border-white/20 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold font-arabic text-white">عربي / قرآن</span>
                  {scriptType === "ARABIC" ? (
                    <div className="h-4 w-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-400">Quran</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-300 font-arabic leading-relaxed">ترجمة و اسلامیات</p>
              </button>
            </div>
          </div>

          {/* ── Subject Overview ────────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 font-display">
              Subject Overview
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the core topics and examination scope of this subject."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20 resize-none font-sans leading-relaxed transition-all"
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
                Available to assign across disciplines and boards.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          {/* ── Subject Cover / Icon ────────────────────────────────── */}
          <div className="space-y-1.5 pt-1">
            <CloudinaryUploadZone
              value={textbookCoverUrl}
              onUpload={(url) => setTextbookCoverUrl(url)}
              onRemove={() => setTextbookCoverUrl(null)}
              label="Subject Cover / Icon"
              hint="PNG, JPG, WebP (Max 10MB)"
              folder="pgc_arena_subjects"
            />
          </div>

          {/* ── Modal Footer Actions ────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={closeCreateSubject}
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
                <span>{isEditing ? "Save Changes" : "Create Subject"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
