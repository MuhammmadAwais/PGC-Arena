"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Search,
  BookOpen,
  ChevronRight,
  Flame,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Plus,
  RefreshCw,
  Building2,
  GraduationCap,
  Filter,
  X,
} from "lucide-react";
import { getCurriculumNodeHubListAction } from "@/features/questions/actions/questionActions";
import type { CurriculumNodeVaultCard } from "@/features/questions/types/questionTypes";
import type { Board, Discipline, ClassLevel } from "@/features/curriculum/types/curriculumTypes";
import { BoardSelectorCards } from "@/features/questions/components/hub/BoardSelectorCards";
import { DisciplineTabs } from "@/features/questions/components/hub/DisciplineTabs";
import { SubjectVaultGrid } from "@/features/questions/components/hub/SubjectVaultGrid";
import { GlobalSearchSubjectGrid } from "@/features/questions/components/hub/GlobalSearchSubjectGrid";

export default function QuestionBankHubPage() {
  const [allNodes, setAllNodes] = useState<CurriculumNodeVaultCard[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);

  const [selectedBoardId, setSelectedBoardId] = useState<string>("");
  const [selectedDisciplineId, setSelectedDisciplineId] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<ClassLevel>(11);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Master Curriculum Nodes on mount or class change
  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getCurriculumNodeHubListAction({
        classLevel: selectedClass,
      });

      if (res.success) {
        setAllNodes(res.nodes);
        if (res.boards.length > 0) {
          setBoards(res.boards);
          // Default select first board if not already set or invalid
          if (!selectedBoardId || !res.boards.some((b) => b.id === selectedBoardId)) {
            setSelectedBoardId(res.boards[0].id);
          }
        }
        if (res.disciplines.length > 0) {
          setDisciplines(res.disciplines);
        }
      }
    } catch (err) {
      console.error("Failed to load question bank hub nodes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  // 2. Filter nodes for selected class level
  const classNodes = useMemo(() => {
    return allNodes.filter((n) => n.class_level === selectedClass);
  }, [allNodes, selectedClass]);

  // 3. Compute Board Stats
  const boardStatsMap = useMemo(() => {
    const map = new Map<string, { disciplinesCount: number; subjectsCount: number; questionsCount: number }>();

    boards.forEach((b) => {
      const bNodes = classNodes.filter((n) => n.board.id === b.id);
      const uniqueDisciplines = new Set(bNodes.map((n) => n.discipline.id));
      const totalQuestions = bNodes.reduce((sum, n) => sum + n.question_count, 0);

      map.set(b.id, {
        disciplinesCount: uniqueDisciplines.size,
        subjectsCount: bNodes.length,
        questionsCount: totalQuestions,
      });
    });

    return map;
  }, [boards, classNodes]);

  // 4. Disciplines available under the currently selected board
  const availableDisciplinesForBoard = useMemo(() => {
    if (!selectedBoardId) return [];
    const bNodes = classNodes.filter((n) => n.board.id === selectedBoardId);
    const uniqueDiscIds = Array.from(new Set(bNodes.map((n) => n.discipline.id)));
    return disciplines.filter((d) => uniqueDiscIds.includes(d.id));
  }, [classNodes, disciplines, selectedBoardId]);

  // 5. Automatically select the first discipline if current selection is invalid
  useEffect(() => {
    if (availableDisciplinesForBoard.length > 0) {
      if (
        !selectedDisciplineId ||
        !availableDisciplinesForBoard.some((d) => d.id === selectedDisciplineId)
      ) {
        setSelectedDisciplineId(availableDisciplinesForBoard[0].id);
      }
    } else {
      setSelectedDisciplineId("");
    }
  }, [availableDisciplinesForBoard, selectedDisciplineId]);

  // 6. Compute Discipline Stats under active board
  const disciplineStatsMap = useMemo(() => {
    const map = new Map<string, { subjectsCount: number; questionsCount: number }>();

    availableDisciplinesForBoard.forEach((d) => {
      const dNodes = classNodes.filter(
        (n) => n.board.id === selectedBoardId && n.discipline.id === d.id
      );
      const totalQuestions = dNodes.reduce((sum, n) => sum + n.question_count, 0);

      map.set(d.id, {
        subjectsCount: dNodes.length,
        questionsCount: totalQuestions,
      });
    });

    return map;
  }, [availableDisciplinesForBoard, classNodes, selectedBoardId]);

  // 7. Leaf Subjects for chosen (Board + Discipline + Class Level)
  const activeSubjectNodes = useMemo(() => {
    return classNodes.filter(
      (n) => n.board.id === selectedBoardId && n.discipline.id === selectedDisciplineId
    );
  }, [classNodes, selectedBoardId, selectedDisciplineId]);

  // 8. Global Search Results (if search is active)
  const isSearchActive = search.trim().length > 0;
  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    const q = search.toLowerCase();
    return classNodes.filter(
      (n) =>
        n.subject.name.toLowerCase().includes(q) ||
        n.subject.code.toLowerCase().includes(q) ||
        n.board.name.toLowerCase().includes(q) ||
        n.board.code.toLowerCase().includes(q) ||
        n.discipline.name.toLowerCase().includes(q)
    );
  }, [classNodes, isSearchActive, search]);

  const activeBoard = boards.find((b) => b.id === selectedBoardId);
  const activeDiscipline = availableDisciplinesForBoard.find(
    (d) => d.id === selectedDisciplineId
  );

  const totalVaultQuestions = useMemo(() => {
    return classNodes.reduce((sum, n) => sum + n.question_count, 0);
  }, [classNodes]);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 font-sans">
      {/* ── 1. Page Header (Clean Campus Style) ────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight">
            Question Bank <span className="text-pgc-red">Vault</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400 font-sans">
            Institutional MCQ repositories organized by educational board syllabus and academic streams.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Class Level Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-black/50 border border-white/10">
            <button
              type="button"
              onClick={() => setSelectedClass(11)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                selectedClass === 11
                  ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Class 11
            </button>
            <button
              type="button"
              onClick={() => setSelectedClass(12)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold font-display uppercase tracking-wider transition-all cursor-pointer ${
                selectedClass === 12
                  ? "bg-pgc-red/20 text-white border border-pgc-red/50 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Class 12
            </button>
          </div>

          <Link
            href="/admin/curriculum"
            className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Curriculum Setup</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Top 4-Card Overview Stats Strip ─────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Total Boards
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
              {boards.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-white flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Academic Streams
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-purple-400 mt-0.5 tracking-tight">
              {disciplines.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Class {selectedClass} Subjects
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-cyan-400 mt-0.5 tracking-tight truncate">
              {classNodes.length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div className="min-w-0 pr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Vaulted Questions
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-pgc-gold mt-0.5 tracking-tight truncate">
              {totalVaultQuestions.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pgc-gold/15 text-pgc-gold flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar (Matching Campus Style) ─────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Instant search for any subject across all boards (e.g. 'Mathematics', 'Physics', 'Computer Science')..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white/25 transition-all font-sans"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <span className="text-xs text-slate-400 font-sans px-2">
            Found <strong className="text-white font-display">{isSearchActive ? searchResults.length : activeSubjectNodes.length}</strong> subjects
          </span>
        </div>
      </div>

      {/* ── 4. Main Progressive Workspace ─────────────────────────── */}
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-32 rounded-2xl bg-white/[0.02] border border-white/[0.08]" />
          <div className="h-14 rounded-2xl bg-white/[0.02] border border-white/[0.08]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.08]" />
            ))}
          </div>
        </div>
      ) : isSearchActive ? (
        /* Instant Search View Override */
        <GlobalSearchSubjectGrid
          nodes={searchResults}
          searchQuery={search}
          onClearSearch={() => setSearch("")}
        />
      ) : (
        /* Progressive Taxonomy Workspace */
        <div className="space-y-6">
          {/* STEP 1: Select Board */}
          <BoardSelectorCards
            boards={boards}
            selectedBoardId={selectedBoardId}
            onSelectBoard={setSelectedBoardId}
            boardStatsMap={boardStatsMap}
          />

          {/* STEP 2: Select Discipline */}
          {availableDisciplinesForBoard.length > 0 ? (
            <DisciplineTabs
              disciplines={availableDisciplinesForBoard}
              selectedDisciplineId={selectedDisciplineId}
              onSelectDiscipline={setSelectedDisciplineId}
              disciplineStatsMap={disciplineStatsMap}
            />
          ) : (
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] text-center space-y-2">
              <p className="text-xs text-slate-400">
                No academic disciplines configured under this board for Class {selectedClass}.
              </p>
              <Link
                href="/admin/curriculum"
                className="text-xs font-bold text-cyan-400 hover:underline"
              >
                Configure in Curriculum Setup ➔
              </Link>
            </div>
          )}

          {/* STEP 3: Subject Vaults Grid */}
          <SubjectVaultGrid
            nodes={activeSubjectNodes}
            boardName={activeBoard?.name || "Selected Board"}
            disciplineName={activeDiscipline?.name || "Selected Stream"}
            classLevel={selectedClass}
          />
        </div>
      )}
    </div>
  );
}
