"use client";

import { useState } from "react";
import {
  CheckSquare,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Flame,
  X,
  Loader2,
} from "lucide-react";
import { useQuestionBankStore } from "../store/useQuestionBankStore";
import { bulkUpdateQuestionsAction } from "../actions/questionActions";
import type { Difficulty } from "../types/questionTypes";

export function BatchSelectionBar() {
  const {
    selectedQuestionIds,
    clearQuestionSelection,
    fetchQuestions,
    fetchVaultData,
  } = useQuestionBankStore();

  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedQuestionIds.length === 0) return null;

  const handleBulkAction = async (
    action: "SET_DIFFICULTY" | "ACTIVATE" | "DEACTIVATE" | "DELETE",
    difficulty?: Difficulty
  ) => {
    setIsProcessing(true);
    try {
      await bulkUpdateQuestionsAction({
        question_ids: selectedQuestionIds,
        action,
        difficulty,
      });
      clearQuestionSelection();
      await fetchQuestions();
      await fetchVaultData();
    } catch (err) {
      console.error("Bulk action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[#0B0C16]/95 border border-pgc-red/40 backdrop-blur-2xl p-3 sm:p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 text-white animate-in slide-in-from-bottom-6 duration-200">
      {/* Count & Deselect */}
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded-xl bg-pgc-red/20 border border-pgc-red/40 flex items-center justify-center text-pgc-red font-display font-bold text-xs">
          {selectedQuestionIds.length}
        </div>
        <div>
          <p className="text-xs font-bold font-display uppercase tracking-wider text-white">
            {selectedQuestionIds.length} Questions Selected
          </p>
          <button
            type="button"
            onClick={clearQuestionSelection}
            disabled={isProcessing}
            className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Set Difficulty Options */}
        <div className="hidden sm:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-display px-1.5">
            Difficulty:
          </span>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleBulkAction("SET_DIFFICULTY", "EASY")}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors cursor-pointer"
          >
            Easy
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleBulkAction("SET_DIFFICULTY", "MEDIUM")}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 transition-colors cursor-pointer"
          >
            Medium
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handleBulkAction("SET_DIFFICULTY", "HARD")}
            className="px-2 py-1 rounded-lg text-[10px] font-bold bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer"
          >
            Hard
          </button>
        </div>

        {/* Bulk Delete */}
        <button
          type="button"
          disabled={isProcessing}
          onClick={() => {
            if (
              confirm(
                `Are you sure you want to permanently delete these ${selectedQuestionIds.length} questions?`
              )
            ) {
              handleBulkAction("DELETE");
            }
          }}
          className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-bold font-display uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
          <span>Delete</span>
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={clearQuestionSelection}
          className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
