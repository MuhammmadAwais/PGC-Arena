"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Copy, Check, ShieldAlert, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useCurriculumStore } from "../../store/useCurriculumStore";
import {
  deleteBoardAction,
  deleteDisciplineAction,
  deleteSubjectAction,
  removeSubjectFromDisciplineAction,
} from "../../actions/curriculumActions";

export function DeleteCurriculumModal() {
  const { deleteModalData, closeDeleteModal, fetchCurriculum } = useCurriculumStore();
  const { isOpen, entityType, entityId, entityName, extraData } = deleteModalData;

  const [isChecked, setIsChecked] = useState(false);
  const [typedPhrase, setTypedPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const targetPhrase = `delete this ${entityName}`.toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setTypedPhrase("");
      setIsDeleting(false);
      setHasCopied(false);
      setError(null);
    }
  }, [isOpen]);

  const isPhraseMatched = typedPhrase.trim().toLowerCase() === targetPhrase;
  const isDeleteEnabled = isChecked && isPhraseMatched && !isDeleting;

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(`delete this ${entityName}`);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeleteEnabled) return;

    setIsDeleting(true);
    setError(null);

    try {
      if (entityType === "board") {
        const res = await deleteBoardAction(entityId);
        if (!res.success) throw new Error(res.error || "Failed to delete board");
      } else if (entityType === "discipline") {
        const res = await deleteDisciplineAction(entityId);
        if (!res.success) throw new Error(res.error || "Failed to delete discipline");
      } else if (entityType === "subject") {
        const res = await deleteSubjectAction(entityId);
        if (!res.success) throw new Error(res.error || "Failed to delete master subject");
      } else if (entityType === "node") {
        const res = await removeSubjectFromDisciplineAction({
          node_id: entityId || undefined,
          board_id: extraData?.boardId,
          discipline_id: extraData?.disciplineId,
          subject_id: extraData?.subjectId,
          class_level: extraData?.classLevel,
        });
        if (!res.success) throw new Error(res.error || "Failed to unlink subject");
      }

      await fetchCurriculum(true);
      closeDeleteModal();
    } catch (err: any) {
      console.error("Deletion execution failed:", err);
      setError(err.message || "Failed to complete deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case "board":
        return "Examination Board";
      case "discipline":
        return "Academic Discipline";
      case "subject":
        return "Master Subject";
      case "node":
        return "Subject Lane Linkage";
      default:
        return "Curriculum Item";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDeleteModal()}>
      <DialogContent className="max-w-md p-6 bg-[#0B0C16]/95 border-red-500/20 text-white backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                Delete {getEntityLabel()}
              </DialogTitle>
              <DialogDescription className="text-xs text-red-400/80">
                Warning: This is a destructive action with cascading syllabus effects.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-red-500/[0.05] border border-red-500/20 space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to permanently delete{" "}
              <strong className="text-white underline">{entityName}</strong>.
            </p>
            <p className="text-[11px] text-slate-400">
              {entityType === "board" && "This will remove the board and all associated discipline/subject mappings."}
              {entityType === "discipline" && "This will unlink all subjects mapped to this discipline across all boards."}
              {entityType === "subject" && "This will delete the master subject and purge all its syllabus mappings."}
              {entityType === "node" && "This will unmap the subject from this board and discipline for this class level."}
            </p>
          </div>

          {/* Verification input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Type Confirmation Phrase
              </label>
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {hasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{hasCopied ? "Copied" : "Copy phrase"}</span>
              </button>
            </div>

            <div className="p-2 rounded-lg bg-black/60 border border-white/10 font-mono text-xs text-red-300 select-all">
              delete this {entityName}
            </div>

            <Input
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              placeholder={`delete this ${entityName}`}
              className="bg-black/50 border-white/15 text-white placeholder-slate-600 text-xs font-mono focus:border-red-500"
              autoFocus
            />
          </div>

          {/* Safety Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded bg-black/50 border-white/20 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-red-500"
            />
            <span className="text-xs text-slate-400">
              I understand that this action cannot be undone and will affect live tournaments.
            </span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={closeDeleteModal}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isDeleteEnabled}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
