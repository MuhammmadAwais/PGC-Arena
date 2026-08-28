"use client";

import { useState, useMemo } from "react";
import {
  Link as LinkIcon,
  Search,
  BookOpen,
  Check,
  Plus,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCurriculumStore } from "../../store/useCurriculumStore";
import { assignSubjectToDisciplineAction } from "../../actions/curriculumActions";
import type { Subject } from "../../types/curriculumTypes";

export function AssignSubjectModal() {
  const {
    assignSubjectTarget,
    closeAssignSubject,
    curriculumData,
    fetchCurriculum,
    openCreateSubject,
  } = useCurriculumStore();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allSubjects = curriculumData?.subjects || [];

  // Find already mapped subject IDs in this target lane
  const mappedSubjectIds = useMemo(() => {
    if (!assignSubjectTarget || !curriculumData) return new Set<string>();
    const nodeIds = curriculumData.nodes
      .filter(
        (n) =>
          n.board_id === assignSubjectTarget.boardId &&
          n.discipline_id === assignSubjectTarget.disciplineId &&
          n.class_level === assignSubjectTarget.classLevel
      )
      .map((n) => n.subject_id);
    return new Set(nodeIds);
  }, [assignSubjectTarget, curriculumData]);

  const filteredSubjects = useMemo(() => {
    return allSubjects.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q))
      );
    });
  }, [allSubjects, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignSubjectTarget || !selectedSubjectId) {
      setError("Please select a subject to assign.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await assignSubjectToDisciplineAction({
        board_id: assignSubjectTarget.boardId,
        discipline_id: assignSubjectTarget.disciplineId,
        subject_id: selectedSubjectId,
        class_level: assignSubjectTarget.classLevel,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to assign subject");
      }

      await fetchCurriculum(true);
      closeAssignSubject();
    } catch (err: any) {
      console.error("Assign subject error:", err);
      setError(err.message || "Failed to assign subject");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assignSubjectTarget) return null;

  return (
    <Dialog open={!!assignSubjectTarget} onOpenChange={(open) => !open && closeAssignSubject()}>
      <DialogContent className="max-w-lg p-6 bg-[#0B0C16]/95 border-white/15 text-white backdrop-blur-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-pgc-red/10 border border-pgc-red/20 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-pgc-red" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold font-display tracking-tight text-white">
                Assign Subject to Discipline Lane
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Link a master subject to {assignSubjectTarget.disciplineName} under{" "}
                {assignSubjectTarget.boardName} (Class {assignSubjectTarget.classLevel}).
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
          {/* Target lane badge summary */}
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs font-sans">
            <div>
              <span className="text-slate-400">Board: </span>
              <strong className="text-white font-display">{assignSubjectTarget.boardName}</strong>
            </div>
            <div>
              <span className="text-slate-400">Discipline: </span>
              <strong className="text-cyan-300 font-display">{assignSubjectTarget.disciplineName}</strong>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-pgc-red/20 text-white font-bold font-display border border-pgc-red/40">
              Class {assignSubjectTarget.classLevel}
            </div>
          </div>

          {/* Search Master Subjects */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-display">
                Select Master Subject
              </label>
              <button
                type="button"
                onClick={() => {
                  closeAssignSubject();
                  openCreateSubject();
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Create New Subject</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search master subjects by name or code..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Subjects Selection List */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {filteredSubjects.length > 0 ? (
              filteredSubjects.map((sub) => {
                const isAlreadyMapped = mappedSubjectIds.has(sub.id);
                const isSelected = selectedSubjectId === sub.id;

                return (
                  <button
                    key={sub.id}
                    type="button"
                    disabled={isAlreadyMapped}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer ${
                      isAlreadyMapped
                        ? "bg-white/[0.01] border-white/[0.04] opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-cyan-500/20 border-cyan-400 text-white shadow-md shadow-cyan-500/10"
                        : "bg-black/30 border-white/10 hover:bg-white/[0.05] hover:border-white/20 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 flex items-center justify-center">
                        {sub.textbook_cover_url ? (
                          <img
                            src={sub.textbook_cover_url}
                            alt={sub.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen className="w-4 h-4 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                            {sub.code}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {sub.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">
                          {sub.script_type === "URDU_NASTALIQ"
                            ? "Urdu Nastaliq"
                            : sub.script_type === "ARABIC"
                            ? "Arabic Script"
                            : "Latin Script"}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAlreadyMapped ? (
                        <span className="text-[10px] font-bold text-slate-500 font-display uppercase">
                          Mapped
                        </span>
                      ) : isSelected ? (
                        <div className="h-5 w-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-white/20" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <p className="text-xs text-slate-400">No matching subjects found.</p>
                <button
                  type="button"
                  onClick={() => {
                    closeAssignSubject();
                    openCreateSubject();
                  }}
                  className="mt-2 text-xs font-bold text-cyan-400 hover:underline"
                >
                  + Create Master Subject
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={closeAssignSubject}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedSubjectId || isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pgc-red to-[#c92f1f] hover:from-[#f04836] hover:to-pgc-red text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pgc-red/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Assign Subject</span>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
