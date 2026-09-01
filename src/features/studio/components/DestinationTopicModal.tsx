"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FolderCheck,
  Check,
  Plus,
  BookOpen,
  Layers,
  GraduationCap,
  Sparkles,
  Loader2,
  AlertCircle,
  FolderPlus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useStudioStore } from "../store/useStudioStore";
import { getCurriculumMetadataAction } from "@/features/library/actions/libraryActions";
import {
  getNodeChaptersAndTopicsAction,
  createChapterAndTopicAction,
  commitApprovedQuestionsAction,
} from "../actions/studioActions";
import type { CurriculumNodeDetails } from "@/features/library/types/libraryTypes";

interface DestinationTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DestinationTopicModal({
  isOpen,
  onClose,
}: DestinationTopicModalProps) {
  const router = useRouter();
  const {
    context,
    setContext,
    selectedBookId,
    availableBooks,
    stagedQuestions,
    clearSession,
    setError: setGlobalError,
  } = useStudioStore();

  const [allNodes, setAllNodes] = useState<CurriculumNodeDetails[]>([]);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  // Cascading Selection State
  const [selectedClass, setSelectedClass] = useState<number>(context.classLevel || 11);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(context.boardId || "");
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>(context.disciplineId || "");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(context.subjectId || "");

  // Chapters & Topics of the selected node
  const [chapters, setChapters] = useState<
    Array<{
      id: string;
      title: string;
      chapter_number: number;
      topics: Array<{ id: string; title: string; topic_number: number }>;
    }>
  >([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");

  // Create on-the-fly mode
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newTopicTitle, setNewTopicTitle] = useState("");

  const [isCommitting, setIsCommitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const approvedQuestions = stagedQuestions.filter((q) => q.reviewStatus === "APPROVED");

  // Selected book reference
  const selectedBook = useMemo(
    () => availableBooks.find((b) => b.id === selectedBookId),
    [availableBooks, selectedBookId]
  );

  // ── 1. Load active curriculum nodes on modal open ─────────────────
  useEffect(() => {
    if (isOpen) {
      setIsLoadingMeta(true);
      setLocalError(null);

      getCurriculumMetadataAction()
        .then((res) => {
          if (res.success && res.nodes.length > 0) {
            setAllNodes(res.nodes);

            // Default to selectedBook's first assignment if available
            const bookAssignment = selectedBook?.assignments?.[0];
            if (bookAssignment) {
              if (bookAssignment.class_level) setSelectedClass(bookAssignment.class_level);
              if (bookAssignment.board_id) setSelectedBoardId(bookAssignment.board_id);
              if (bookAssignment.discipline_id) setSelectedDisciplineId(bookAssignment.discipline_id);
              if (bookAssignment.subject_id) setSelectedSubjectId(bookAssignment.subject_id);
            }
          }
        })
        .finally(() => setIsLoadingMeta(false));
    }
  }, [isOpen, selectedBook]);

  // ── 2. Derive Available Boards ─────────────────────────────────────
  const availableBoards = useMemo(() => {
    const classNodes = allNodes.filter((n) => n.class_level === selectedClass);
    const map = new Map<string, { id: string; name: string; code: string }>();
    classNodes.forEach((n) => {
      if (!map.has(n.board_id)) {
        map.set(n.board_id, { id: n.board_id, name: n.board_name, code: n.board_code });
      }
    });
    return Array.from(map.values());
  }, [allNodes, selectedClass]);

  useEffect(() => {
    if (availableBoards.length > 0) {
      if (!availableBoards.some((b) => b.id === selectedBoardId)) {
        setSelectedBoardId(availableBoards[0].id);
      }
    } else {
      setSelectedBoardId("");
    }
  }, [availableBoards, selectedBoardId]);

  // ── 3. Derive Available Disciplines ────────────────────────────────
  const availableDisciplines = useMemo(() => {
    if (!selectedBoardId) return [];
    const boardNodes = allNodes.filter(
      (n) => n.class_level === selectedClass && n.board_id === selectedBoardId
    );
    const map = new Map<string, { id: string; name: string; code: string }>();
    boardNodes.forEach((n) => {
      if (!map.has(n.discipline_id)) {
        map.set(n.discipline_id, { id: n.discipline_id, name: n.discipline_name, code: n.discipline_code });
      }
    });
    return Array.from(map.values());
  }, [allNodes, selectedClass, selectedBoardId]);

  useEffect(() => {
    if (availableDisciplines.length > 0) {
      if (!availableDisciplines.some((d) => d.id === selectedDisciplineId)) {
        setSelectedDisciplineId(availableDisciplines[0].id);
      }
    } else {
      setSelectedDisciplineId("");
    }
  }, [availableDisciplines, selectedDisciplineId]);

  // ── 4. Derive Available Subjects ───────────────────────────────────
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
        map.set(n.subject_id, { id: n.subject_id, name: n.subject_name, code: n.subject_code });
      }
    });
    return Array.from(map.values());
  }, [allNodes, selectedClass, selectedBoardId, selectedDisciplineId]);

  useEffect(() => {
    if (availableSubjects.length > 0) {
      if (!availableSubjects.some((s) => s.id === selectedSubjectId)) {
        setSelectedSubjectId(availableSubjects[0].id);
      }
    } else {
      setSelectedSubjectId("");
    }
  }, [availableSubjects, selectedSubjectId]);

  // Matching node ID
  const matchedNode = useMemo(() => {
    return allNodes.find(
      (n) =>
        n.class_level === selectedClass &&
        n.board_id === selectedBoardId &&
        n.discipline_id === selectedDisciplineId &&
        n.subject_id === selectedSubjectId
    );
  }, [allNodes, selectedClass, selectedBoardId, selectedDisciplineId, selectedSubjectId]);

  // ── 5. Fetch Chapters & Topics whenever matchedNode changes ───────
  useEffect(() => {
    if (matchedNode?.id) {
      setIsLoadingChapters(true);
      getNodeChaptersAndTopicsAction(matchedNode.id)
        .then((res) => {
          if (res.success) {
            setChapters(res.chapters);
            if (res.chapters.length > 0) {
              setSelectedChapterId(res.chapters[0].id);
              if (res.chapters[0].topics.length > 0) {
                setSelectedTopicId(res.chapters[0].topics[0].id);
              } else {
                setSelectedTopicId("");
              }
            } else {
              setSelectedChapterId("");
              setSelectedTopicId("");
            }
          }
        })
        .finally(() => setIsLoadingChapters(false));
    } else {
      setChapters([]);
      setSelectedChapterId("");
      setSelectedTopicId("");
    }
  }, [matchedNode]);

  // Available topics in currently selected chapter
  const currentTopics = useMemo(() => {
    const chap = chapters.find((c) => c.id === selectedChapterId);
    return chap?.topics || [];
  }, [chapters, selectedChapterId]);

  useEffect(() => {
    if (currentTopics.length > 0) {
      if (!currentTopics.some((t) => t.id === selectedTopicId)) {
        setSelectedTopicId(currentTopics[0].id);
      }
    } else {
      setSelectedTopicId("");
    }
  }, [currentTopics, selectedTopicId]);

  // ── 6. Final Commit Execution ─────────────────────────────────────
  const handleConfirmCommit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (approvedQuestions.length === 0) {
      setLocalError("Please approve at least 1 question before saving.");
      return;
    }

    if (!matchedNode) {
      setLocalError("Please select a valid curriculum board, class, and subject.");
      return;
    }

    let finalTopicId = selectedTopicId;
    let finalChapterTitle = chapters.find((c) => c.id === selectedChapterId)?.title || "General Chapter";
    let finalTopicTitle = currentTopics.find((t) => t.id === selectedTopicId)?.title || "General Topic";

    setIsCommitting(true);
    setLocalError(null);

    try {
      // 1. If user is creating on the fly or no topic exists
      if (isCreatingNew || !finalTopicId) {
        if (!newChapterTitle.trim() || !newTopicTitle.trim()) {
          throw new Error("Please enter a Chapter Name and Topic Name to create.");
        }
        const createRes = await createChapterAndTopicAction(
          matchedNode.id,
          newChapterTitle.trim(),
          newTopicTitle.trim()
        );
        if (!createRes.success || !createRes.topicId) {
          throw new Error(createRes.error || "Failed to create new topic.");
        }
        finalTopicId = createRes.topicId;
        finalChapterTitle = newChapterTitle.trim();
        finalTopicTitle = newTopicTitle.trim();
      }

      // 2. Save approved questions to database vault
      const commitRes = await commitApprovedQuestionsAction(
        finalTopicId,
        stagedQuestions
      );

      if (!commitRes.success) {
        throw new Error(commitRes.error || "Failed to save questions.");
      }

      // 3. Update store context
      setContext({
        nodeId: matchedNode.id,
        boardId: matchedNode.board_id,
        boardName: matchedNode.board_name,
        boardCode: matchedNode.board_code,
        disciplineId: matchedNode.discipline_id,
        disciplineName: matchedNode.discipline_name,
        classLevel: matchedNode.class_level,
        subjectId: matchedNode.subject_id,
        subjectName: matchedNode.subject_name,
        chapterTitle: finalChapterTitle,
        topicId: finalTopicId,
        topicTitle: finalTopicTitle,
      });

      // Clear local session & Close
      clearSession();
      onClose();

      // Redirect to the Question Bank subject vault!
      router.push(`/admin/question-bank/${matchedNode.id}`);
    } catch (err: any) {
      console.error("Save error:", err);
      setLocalError(err.message || "Failed to save questions to question bank.");
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[95vw] max-w-2xl bg-[#0B0C16]/95 border border-emerald-500/30 text-white backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-2xl font-sans">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black font-display tracking-tight text-white">
                Save Questions to Topic
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Choose the Board, Subject, Chapter, and Topic where you would like to store these {approvedQuestions.length} approved questions.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {localError && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleConfirmCommit} className="space-y-4 pt-1">
          {/* Cascading Target Curriculum Selectors */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-emerald-400">
                Target Curriculum Node:
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Strict Hierarchy Mapping
              </span>
            </div>

            {isLoadingMeta ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading curriculum hierarchy...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Class Toggle */}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 2. Board */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                      Board:
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

                  {/* 3. Stream */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                      Stream:
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

                  {/* 4. Subject */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                      Subject:
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
              </div>
            )}
          </div>

          {/* Chapter & Topic Selector */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-display uppercase tracking-wider text-cyan-400">
                Destination Unit &amp; Topic:
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingNew(!isCreatingNew)}
                className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isCreatingNew ? (
                  <span>Select Existing Topic</span>
                ) : (
                  <>
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>+ Create New Unit/Topic</span>
                  </>
                )}
              </button>
            </div>

            {isCreatingNew ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                    New Chapter Title:
                  </label>
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="e.g. Applied Grammar & Idioms"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/40"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                    New Topic Title:
                  </label>
                  <input
                    type="text"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    placeholder="e.g. Common Idiomatic Expressions"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400/40"
                  />
                </div>
              </div>
            ) : isLoadingChapters ? (
              <div className="py-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Loading chapters &amp; topics...</span>
              </div>
            ) : chapters.length === 0 ? (
              <div className="p-3 rounded-xl bg-pgc-red/10 border border-pgc-red/25 text-xs text-red-200 flex items-center justify-between gap-2">
                <span>No chapters exist for this subject yet.</span>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(true)}
                  className="px-2.5 py-1 rounded-lg bg-pgc-red/20 text-white font-bold hover:bg-pgc-red/30 transition-colors cursor-pointer"
                >
                  + Create Unit
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Chapter Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                    Chapter / Unit:
                  </label>
                  <SearchableSelect
                    options={chapters.map((c) => ({
                      value: c.id,
                      label: c.title,
                      badge: `Ch ${c.chapter_number}`,
                    }))}
                    value={selectedChapterId}
                    onChange={(val) => setSelectedChapterId(val)}
                    placeholder="Select Chapter..."
                    searchPlaceholder="Search chapters..."
                  />
                </div>

                {/* Topic Dropdown */}
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 font-display">
                    Topic:
                  </label>
                  {currentTopics.length > 0 ? (
                    <SearchableSelect
                      options={currentTopics.map((t) => ({
                        value: t.id,
                        label: t.title,
                        badge: `${t.topic_number}`,
                      }))}
                      value={selectedTopicId}
                      onChange={(val) => setSelectedTopicId(val)}
                      placeholder="Select Topic..."
                      searchPlaceholder="Search topics..."
                      align="end"
                    />
                  ) : (
                    <div className="text-xs text-slate-400 italic p-2 rounded-xl bg-black/30 border border-white/5">
                      No topics in this chapter.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              disabled={isCommitting}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isCommitting || approvedQuestions.length === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving {approvedQuestions.length} Questions...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm &amp; Save {approvedQuestions.length} Questions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
