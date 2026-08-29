"use client";

import { useState, useEffect } from "react";
import { Folder, Loader2, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useQuestionBankStore } from "../../store/useQuestionBankStore";
import {
  createChapterAction,
  updateChapterAction,
} from "../../actions/questionActions";

export function CreateEditChapterModal() {
  const {
    isCreateChapterOpen,
    closeCreateChapter,
    editChapterData,
    vaultData,
    fetchVaultData,
    fetchQuestions,
  } = useQuestionBankStore();

  const isEditing = !!editChapterData;

  const [chapterNumber, setChapterNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editChapterData) {
      setChapterNumber(editChapterData.chapter_number);
      setTitle(editChapterData.title);
      setDescription(editChapterData.description || "");
      setIsActive(editChapterData.is_active);
    } else {
      const nextNum = (vaultData?.chapters.length || 0) + 1;
      setChapterNumber(nextNum);
      setTitle("");
      setDescription("");
      setIsActive(true);
    }
    setError(null);
  }, [editChapterData, isCreateChapterOpen, vaultData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultData?.curriculum_node_id) {
      setError("No active curriculum node context found.");
      return;
    }
    if (!title.trim()) {
      setError("Chapter title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && editChapterData) {
        const res = await updateChapterAction({
          id: editChapterData.id,
          chapter_number: chapterNumber,
          title: title.trim(),
          description: description.trim() || null,
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error || "Failed to update chapter");
      } else {
        const res = await createChapterAction({
          curriculum_node_id: vaultData.curriculum_node_id,
          chapter_number: chapterNumber,
          title: title.trim(),
          description: description.trim() || null,
          is_active: isActive,
        });

        if (!res.success) throw new Error(res.error || "Failed to create chapter");
      }

      await fetchVaultData();
      await fetchQuestions();
      closeCreateChapter();
    } catch (err: any) {
      console.error("Chapter modal error:", err);
      setError(err.message || "Failed to save chapter");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isCreateChapterOpen} onOpenChange={(open) => !open && closeCreateChapter()}>
      <DialogContent className="max-w-md p-6 bg-[#0B0C16]/95 border-white/15 text-white backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Folder className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                {isEditing ? "Edit Syllabus Chapter" : "Create Syllabus Chapter"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                {vaultData?.board?.code} • {vaultData?.discipline?.code} • Class {vaultData?.classLevel} • {vaultData?.subject?.name || "Subject"}
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
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Chapter # <span className="text-pgc-red">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={chapterNumber}
                onChange={(e) => setChapterNumber(Number(e.target.value))}
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs font-mono focus:border-cyan-400"
              />
            </div>

            <div className="col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Chapter Title <span className="text-pgc-red">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Overview of Computer System"
                required
                className="bg-black/50 border-white/15 text-white placeholder-slate-500 text-xs focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
              Scope / Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline topics covered in this unit."
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 resize-none font-sans"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/10">
            <div>
              <p className="text-xs font-bold text-white font-display">Active Chapter</p>
              <p className="text-[11px] text-slate-400">
                Visible for tournament rounds and study modules.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={closeCreateChapter}
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
                <span>{isEditing ? "Save Changes" : "Create Chapter"}</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
