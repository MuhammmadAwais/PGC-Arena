"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Trash2, Copy, Check, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export type DeletableEntityType =
  | "campus"
  | "team"
  | "member"
  | "player"
  | "captain"
  | "teacher"
  | "manager";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: DeletableEntityType;
  entityName: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationModal({
  isOpen,
  onOpenChange,
  entityType,
  entityName,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [typedPhrase, setTypedPhrase] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exact required target phrase: "delete this {entityName}"
  const targetPhrase = `delete this ${entityName}`;

  // Reset modal state upon open/close
  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
      setTypedPhrase("");
      setIsDeleting(false);
      setHasCopied(false);
      setError(null);
    }
  }, [isOpen]);

  const isPhraseMatched =
    typedPhrase.trim().toLowerCase() === targetPhrase.trim().toLowerCase();
  const isDeleteEnabled = isChecked && isPhraseMatched && !isDeleting;

  const handleCopyPhrase = () => {
    navigator.clipboard.writeText(targetPhrase);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDeleteEnabled) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Deletion execution failed:", err);
      setError(err.message || "Failed to complete deletion.");
      setIsDeleting(false);
    }
  };

  const getEntityLabel = () => {
    switch (entityType) {
      case "campus":
        return "Campus";
      case "team":
        return "Esports Squad";
      case "captain":
        return "Team Captain";
      case "teacher":
        return "Faculty Coach";
      case "manager":
        return "Campus Manager";
      case "player":
        return "Student Player";
      default:
        return "Member";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0C16]/98 border border-white/10 text-white max-w-md backdrop-blur-2xl rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 overflow-x-hidden">
        <DialogHeader>
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pgc-red/25 to-pgc-red/5 border border-pgc-red/30 text-pgc-red flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(227,59,41,0.25)]">
            <ShieldAlert className="w-5 h-5 text-pgc-red" />
          </div>
          <DialogTitle className="font-display text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Delete {getEntityLabel()}</span>
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-xs font-sans leading-relaxed">
            You are about to permanently delete <strong className="text-white font-bold">{entityName}</strong>. This action is irreversible.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleDelete} className="space-y-4 mt-2">
          {/* Target Phrase Display with 1-Click Copy */}
          <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-sans">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Required Confirmation Text:
              </span>
              <button
                type="button"
                onClick={handleCopyPhrase}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy to clipboard"
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3 h-3 text-pgc-emerald" />
                    <span className="text-pgc-emerald font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-white/50" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="px-2.5 py-1.5 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-pgc-red font-bold select-all break-all">
              {targetPhrase}
            </div>
          </div>

          {/* Type-in Confirmation Field */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block font-sans">
              Type the confirmation phrase to proceed:
            </label>
            <div className="relative">
              <Input
                placeholder={`Type "${targetPhrase}"`}
                value={typedPhrase}
                onChange={(e) => setTypedPhrase(e.target.value)}
                required
                className={`h-11 pr-9 bg-black/40 border text-white placeholder-white/20 text-xs font-mono rounded-xl transition-colors ${
                  isPhraseMatched
                    ? "border-pgc-emerald/60 focus-visible:border-pgc-emerald focus-visible:ring-1 focus-visible:ring-pgc-emerald"
                    : typedPhrase.length > 0
                    ? "border-amber-400/50 focus-visible:border-amber-400"
                    : "border-white/10 focus-visible:border-pgc-red/60 focus-visible:ring-1 focus-visible:ring-pgc-red/40"
                }`}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isPhraseMatched ? (
                  <Check className="w-4 h-4 text-pgc-emerald" />
                ) : (
                  typedPhrase.length > 0 && <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </div>
          </div>

          {/* Irreversible Consent Checkbox */}
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-pgc-red/5 border border-pgc-red/20 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded bg-black/60 border-white/20 text-pgc-red focus:ring-pgc-red cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-200 leading-snug font-sans">
              I understand that this action cannot be undone and all associated rankings and tournament records will be permanently removed.
            </span>
          </label>

          {error && (
            <div className="p-3 rounded-xl bg-pgc-red/10 border border-pgc-red/30 text-xs text-pgc-red font-sans">
              {error}
            </div>
          )}

          {/* Action Buttons */}
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
              disabled={!isDeleteEnabled}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-pgc-red text-white text-xs font-bold hover:bg-pgc-hover active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(227,59,41,0.3)] cursor-pointer font-sans"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeleting ? "Deleting..." : `Delete ${getEntityLabel()}`}</span>
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
