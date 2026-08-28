"use client";

import { useState, useEffect } from "react";
import { BookMarked, Loader2, AlertCircle, Languages, Globe } from "lucide-react";
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
      <DialogContent className="max-w-lg p-6 bg-[#0B0C16]/95 border-white/15 text-white backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <BookMarked className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Master Subject" : "Create Master Subject"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {isEditing
                  ? "Update subject details, script typography, or textbook media."
                  : "Register a master academic subject in the institutional curriculum bank."}
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
                className={`bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs focus:border-cyan-400 ${
                  scriptType === "URDU_NASTALIQ"
                    ? "font-urdu-nastaliq text-right leading-loose"
                    : scriptType === "ARABIC"
                    ? "font-arabic text-right leading-loose"
                    : "font-sans"
                }`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Code <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="CS"
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs font-mono uppercase focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Script Type Selector with Multi-Script typography badges */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multi-Script Engine &amp; Typography</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setScriptType("LATIN")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  scriptType === "LATIN"
                    ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                    : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold font-display">Latin (En)</span>
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <p className="text-[10px] text-slate-400 font-sans">English UI &amp; Science</p>
              </button>

              <button
                type="button"
                onClick={() => setScriptType("URDU_NASTALIQ")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  scriptType === "URDU_NASTALIQ"
                    ? "bg-emerald-500/15 border-emerald-400 text-white shadow-md shadow-emerald-500/10"
                    : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold font-display">اردو نستعلیق</span>
                  <span className="text-xs text-emerald-400 font-urdu-sans">Urdu</span>
                </div>
                <p className="text-[10px] text-slate-400 font-urdu-nastaliq">ادبیات اور گرامر</p>
              </button>

              <button
                type="button"
                onClick={() => setScriptType("ARABIC")}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  scriptType === "ARABIC"
                    ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10"
                    : "bg-black/40 border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold font-display">عربي / قرآن</span>
                  <span className="text-xs text-amber-400 font-arabic">Quran</span>
                </div>
                <p className="text-[10px] text-slate-400 font-arabic">ترجمة و اسلامیات</p>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
              Subject Overview / Syllabus Scope
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the domains, chapters, and assessment focus of this subject."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
            <div>
              <p className="text-xs font-bold text-white font-display">Active Subject Status</p>
              <p className="text-[11px] text-slate-400">
                Available for curriculum node mapping.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <CloudinaryUploadZone
            label="Official Textbook Cover"
            variant="avatar"
            value={textbookCoverUrl}
            onUpload={setTextbookCoverUrl}
            onRemove={() => setTextbookCoverUrl(null)}
            folder="subjects/covers"
          />

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeCreateSubject}
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
                <span>{isEditing ? "Save Changes" : "Create Subject"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
