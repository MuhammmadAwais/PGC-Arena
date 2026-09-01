"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket,
  Trash2,
  CheckCircle2,
  Inbox,
  XCircle,
  Loader2,
} from "lucide-react";
import { useStudioStore } from "../store/useStudioStore";
import { commitApprovedQuestionsAction } from "../actions/studioActions";
import { DestinationTopicModal } from "./DestinationTopicModal";

export function StudioStickyFooter() {
  const router = useRouter();
  const {
    context,
    stagedQuestions,
    clearSession,
    setError,
  } = useStudioStore();

  const [isCommitting, setIsCommitting] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);

  if (stagedQuestions.length === 0) return null;

  const approved = stagedQuestions.filter((q) => q.reviewStatus === "APPROVED");
  const inbox = stagedQuestions.filter((q) => q.reviewStatus === "INBOX");
  const discarded = stagedQuestions.filter((q) => q.reviewStatus === "DISCARDED");

  const handleCommit = async () => {
    if (approved.length === 0) {
      setError("Please approve at least 1 question before committing to vault.");
      return;
    }

    // If topic is not configured, open the destination selection modal!
    if (!context.topicId) {
      setError(null);
      setIsDestinationModalOpen(true);
      return;
    }

    setIsCommitting(true);
    setError(null);

    try {
      const res = await commitApprovedQuestionsAction(context.topicId, stagedQuestions);
      if (!res.success) {
        throw new Error(res.error || "Failed to commit approved questions.");
      }

      // Clear local session after successful commit
      clearSession();

      // Redirect back to the subject vault
      if (context.nodeId) {
        router.push(`/admin/question-bank/${context.nodeId}`);
      } else {
        router.push("/admin/question-bank");
      }
    } catch (err: any) {
      console.error("Commit failed:", err);
      setError(err.message || "Failed to commit questions to database vault.");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-4xl bg-[#0B0C16]/95 border border-amber-500/30 backdrop-blur-2xl p-3.5 sm:p-4 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col sm:flex-row items-center justify-between gap-3 text-white font-sans animate-in slide-in-from-bottom-6 duration-300">
      {/* ── Summary Counters ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Inbox className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Inbox:</span>
          <span className="font-mono font-bold text-white">{inbox.length}</span>
        </div>

        <span className="text-white/20">•</span>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">Approved:</span>
          <span className="font-mono font-bold text-emerald-300">{approved.length}</span>
        </div>

        <span className="text-white/20">•</span>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <XCircle className="w-4 h-4 text-red-400" />
          <span className="text-slate-400">Discarded:</span>
          <span className="font-mono font-bold text-red-300">{discarded.length}</span>
        </div>
      </div>

      {/* ── Commit / Clear Actions ─────────────────────────────────── */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to discard all staged questions in this session?")) {
              clearSession();
            }
          }}
          disabled={isCommitting}
          className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Staging</span>
        </button>

        <button
          type="button"
          onClick={handleCommit}
          disabled={isCommitting || approved.length === 0}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer hover:scale-[1.02]"
        >
          {isCommitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Committing {approved.length} MCQs...</span>
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 fill-black" />
              <span>Commit {approved.length} Approved to Vault</span>
            </>
          )}
        </button>
      </div>

      {/* Destination Curriculum Topic Modal */}
      <DestinationTopicModal
        isOpen={isDestinationModalOpen}
        onClose={() => setIsDestinationModalOpen(false)}
      />
    </div>
  );
}
