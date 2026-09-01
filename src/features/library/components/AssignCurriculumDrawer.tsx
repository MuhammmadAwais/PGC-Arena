"use client";

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Plus,
  Trash2,
  BookOpen,
  Check,
  Building2,
  GraduationCap,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  LibraryBook,
  BookAssignmentPayload,
  CurriculumNodeDetails,
} from "../types/libraryTypes";
import {
  getCurriculumMetadataAction,
  updateBookAssignmentsAction,
  saveBookRecordAction,
} from "../actions/libraryActions";

interface AssignCurriculumDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  book: Partial<LibraryBook> | null;
  isNewUpload?: boolean;
  onSuccess: () => void;
}

export function AssignCurriculumDrawer({
  isOpen,
  onClose,
  book,
  isNewUpload = false,
  onSuccess,
}: AssignCurriculumDrawerProps) {
  const [allNodes, setAllNodes] = useState<CurriculumNodeDetails[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const [bookTitle, setBookTitle] = useState(book?.title || "");
  const [assignments, setAssignments] = useState<BookAssignmentPayload[]>([]);

  // Cascading Selection State
  const [selectedClass, setSelectedClass] = useState<number>(11);
  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Load Curriculum Nodes on Open ──────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setBookTitle(book?.title || "");
      setAssignments(
        book?.assignments?.map((a) => ({
          board_id: a.board_id,
          discipline_id: a.discipline_id,
          subject_id: a.subject_id,
          class_level: a.class_level,
          curriculum_node_id: a.curriculum_node_id,
        })) || []
      );
      setError(null);
      setIsLoadingMeta(true);

      getCurriculumMetadataAction()
        .then((res) => {
          if (res.success && res.nodes.length > 0) {
            setAllNodes(res.nodes);
          }
        })
        .finally(() => setIsLoadingMeta(false));
    }
  }, [isOpen, book]);

  // ── 1. Derive Boards configured for selected Class Level ────────
  const availableBoards = useMemo(() => {
    const classNodes = allNodes.filter((n) => n.class_level === selectedClass);
    const map = new Map<string, { id: string; name: string; code: string }>();
    classNodes.forEach((n) => {
      if (!map.has(n.board_id)) {
        map.set(n.board_id, {
          id: n.board_id,
          name: n.board_name,
          code: n.board_code,
        });
      }
    });
    return Array.from(map.values());
  }, [allNodes, selectedClass]);

  // Auto-sync selectedBoardId when availableBoards changes
  useEffect(() => {
    if (availableBoards.length > 0) {
      if (!availableBoards.some((b) => b.id === selectedBoardId)) {
        setSelectedBoardId(availableBoards[0].id);
      }
    } else {
      setSelectedBoardId("");
    }
  }, [availableBoards, selectedBoardId]);

  // ── 2. Derive Disciplines configured for selected Board & Class ─
  const availableDisciplines = useMemo(() => {
    if (!selectedBoardId) return [];
    const boardNodes = allNodes.filter(
      (n) => n.class_level === selectedClass && n.board_id === selectedBoardId
    );
    const map = new Map<string, { id: string; name: string; code: string }>();
    boardNodes.forEach((n) => {
      if (!map.has(n.discipline_id)) {
        map.set(n.discipline_id, {
          id: n.discipline_id,
          name: n.discipline_name,
          code: n.discipline_code,
        });
      }
    });
    return Array.from(map.values());
  }, [allNodes, selectedClass, selectedBoardId]);

  // Auto-sync selectedDisciplineId
  useEffect(() => {
    if (availableDisciplines.length > 0) {
      if (!availableDisciplines.some((d) => d.id === selectedDisciplineId)) {
        setSelectedDisciplineId(availableDisciplines[0].id);
      }
    } else {
      setSelectedDisciplineId("");
    }
  }, [availableDisciplines, selectedDisciplineId]);

  // ── 3. Derive Subjects configured for selected Board, Class, Discipline ─
  const availableSubjects = useMemo(() => {
    if (!selectedBoardId || !selectedDisciplineId) return [];
    const matchedNodes = allNodes.filter(
      (n) =>
        n.class_level === selectedClass &&
        n.board_id === selectedBoardId &&
        n.discipline_id === selectedDisciplineId
    );
    const map = new Map<string, { id: string; name: string; code: string }>();
    matchedNodes.forEach((n) => {
      if (!map.has(n.subject_id)) {
        map.set(n.subject_id, {
          id: n.subject_id,
          name: n.subject_name,
          code: n.subject_code,
        });
      }
    });
    return Array.from(map.values());
  }, [allNodes, selectedClass, selectedBoardId, selectedDisciplineId]);

  // Auto-sync selectedSubjectId
  useEffect(() => {
    if (availableSubjects.length > 0) {
      if (!availableSubjects.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(availableSubjects[0].id);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [availableSubjects, selectedSubjectId]);

  // Find matching node ID for current selection
  const currentMatchingNode = useMemo(() => {
    return allNodes.find(
      (n) =>
        n.class_level === selectedClass &&
        n.board_id === selectedBoardId &&
        n.discipline_id === selectedDisciplineId &&
        n.subject_id === selectedSubjectId
    );
  }, [allNodes, selectedClass, selectedBoardId, selectedDisciplineId, selectedSubjectId]);

  // ── Add Mapping Action ─────────────────────────────────────────
  const handleAddAssignment = () => {
    if (!selectedBoardId || !selectedDisciplineId || !selectedSubjectId) {
      setError("Please select a valid Board, Discipline, and Subject combination.");
      return;
    }

    // Check duplicate
    const exists = assignments.some(
      (a) =>
        a.board_id === selectedBoardId &&
        a.discipline_id === selectedDisciplineId &&
        a.subject_id === selectedSubjectId &&
        a.class_level === selectedClass
    );

    if (exists) {
      setError("This exact syllabus combination is already added to this book.");
      return;
    }

    setError(null);
    setAssignments((prev) => [
      ...prev,
      {
        board_id: selectedBoardId,
        discipline_id: selectedDisciplineId,
        subject_id: selectedSubjectId,
        class_level: selectedClass,
        curriculum_node_id: currentMatchingNode?.id || null,
      },
    ]);
  };

  const handleRemoveAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit & Persist Mappings ──────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      setError("Textbook title is required.");
      return;
    }

    // If the user selected a valid syllabus but forgot to click "+ Add Mapping", auto-include it
    let finalAssignments = [...assignments];
    if (
      finalAssignments.length === 0 &&
      selectedBoardId &&
      selectedDisciplineId &&
      selectedSubjectId
    ) {
      finalAssignments.push({
        board_id: selectedBoardId,
        discipline_id: selectedDisciplineId,
        subject_id: selectedSubjectId,
        class_level: selectedClass,
        curriculum_node_id: currentMatchingNode?.id || null,
      });
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isNewUpload) {
        if (!book?.file_url || !book?.file_key) {
          throw new Error("Uploaded file details are missing.");
        }
        const res = await saveBookRecordAction({
          title: bookTitle.trim(),
          file_url: book.file_url,
          file_key: book.file_key,
          file_size_bytes: book.file_size_bytes || null,
          page_count: book.page_count || null,
          assignments: finalAssignments,
        });

        if (!res.success) throw new Error(res.error || "Failed to save book record");
      } else {
        if (!book?.id) throw new Error("Book ID is missing");
        const res = await updateBookAssignmentsAction({
          book_id: book.id,
          assignments: finalAssignments,
        });

        if (!res.success) throw new Error(res.error || "Failed to update assignments");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Save Assignment Error:", err);
      setError(err.message || "Failed to save textbook assignments.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper label formatters from allNodes
  const getNodeDetails = (a: BookAssignmentPayload) => {
    const matched = allNodes.find(
      (n) =>
        n.board_id === a.board_id &&
        n.discipline_id === a.discipline_id &&
        n.subject_id === a.subject_id &&
        n.class_level === a.class_level
    );
    return {
      boardName: matched?.board_name || "Board",
      disciplineName: matched?.discipline_name || "Discipline",
      subjectName: matched?.subject_name || "Subject",
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl bg-[#0B0C16]/95 border border-white/15 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black font-display tracking-tight text-white">
                {isNewUpload ? "Assign Uploaded Textbook" : "Edit Syllabus Assignments"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Map this textbook strictly to configured Boards, Disciplines, and Subjects in your curriculum.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 font-sans pt-1">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
              Textbook / Past Paper Title:
            </label>
            <input
              type="text"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g. Punjab Board Physics Part 1 (Comprehensive Edition)..."
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
            />
          </div>

          {/* Cascading Curriculum Builder */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Syllabus Mapping:</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Strict Curriculum Cascade
              </span>
            </div>

            {isLoadingMeta ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Loading active curriculum structure...</span>
              </div>
            ) : allNodes.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                No active curriculum nodes configured yet. Please configure boards and subjects in the Curriculum page first.
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Class Level Toggle */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                    1. Class Level:
                  </label>
                  <div className="flex items-center gap-2">
                    {[11, 12].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setSelectedClass(lvl)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-bold font-display uppercase transition-all cursor-pointer ${
                          selectedClass === lvl
                            ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-sm"
                            : "bg-black/50 text-slate-400 border border-white/10 hover:text-white"
                        }`}
                      >
                        Class {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 2. Board Selector (Only boards configured for selectedClass) */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                      2. Educational Board:
                    </label>
                    <SearchableSelect
                      options={availableBoards.map((b) => ({
                        value: b.id,
                        label: b.name,
                        badge: b.code,
                      }))}
                      value={selectedBoardId}
                      onChange={(val) => setSelectedBoardId(val)}
                      placeholder="Select Board..."
                      searchPlaceholder="Search boards..."
                    />
                  </div>

                  {/* 3. Discipline Selector (Only disciplines in selected Board & Class) */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                      3. Academic Stream:
                    </label>
                    <SearchableSelect
                      options={availableDisciplines.map((d) => ({
                        value: d.id,
                        label: d.name,
                        badge: d.code,
                      }))}
                      value={selectedDisciplineId}
                      onChange={(val) => setSelectedDisciplineId(val)}
                      placeholder="Select Stream..."
                      searchPlaceholder="Search streams..."
                    />
                  </div>

                  {/* 4. Subject Selector (Only subjects in selected Board + Class + Stream) */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                      4. Subject:
                    </label>
                    <SearchableSelect
                      options={availableSubjects.map((s) => ({
                        value: s.id,
                        label: s.name,
                        badge: s.code,
                      }))}
                      value={selectedSubjectId}
                      onChange={(val) => setSelectedSubjectId(val)}
                      placeholder="Select Subject..."
                      searchPlaceholder="Search subjects..."
                      align="end"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddAssignment}
                  className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-pgc-red/15 border border-white/10 hover:border-pgc-red/40 text-xs font-bold font-display uppercase tracking-wider text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-pgc-red" />
                  <span>Add This Syllabus Mapping</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Configured Mappings List */}
          <div className="space-y-2">
            <span className="text-[10px] font-display uppercase tracking-wider font-bold text-slate-400 block">
              Configured Mappings ({assignments.length}):
            </span>

            {assignments.length > 0 ? (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                {assignments.map((a, idx) => {
                  const details = getNodeDetails(a);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <span className="font-bold text-white font-display">
                          {details.boardName}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-cyan-300 font-bold">
                          {details.subjectName}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-purple-300 text-[11px]">
                          {details.disciplineName}
                        </span>
                        <span className="text-white/20">•</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-pgc-red/15 text-pgc-red border border-pgc-red/30">
                          Class {a.class_level || 11}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAssignment(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                        title="Remove Mapping"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic p-3 rounded-xl bg-black/20 border border-white/5">
                No mappings added to list yet. Clicking "Save" will automatically apply the current selection above.
              </p>
            )}
          </div>

          {/* Footer CTAs */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50 hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>
                    {isNewUpload ? "Complete & Save Textbook" : "Save & Apply Assignments"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
