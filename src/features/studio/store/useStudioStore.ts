import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  StudioContext,
  StudioScope,
  GenerationConfig,
  StagedQuestion,
  ReviewStatus,
} from "../types/studioTypes";
import type { LibraryBook } from "@/features/library/types/libraryTypes";
import { lintMcq } from "../utils/linter";

interface StudioStoreState {
  // ── Context & Navigation ────────────────────────────────────
  context: StudioContext;
  scope: StudioScope;
  generationConfig: GenerationConfig;
  selectedBookId: string | null;
  selectedBook: LibraryBook | null;
  availableBooks: LibraryBook[];

  // ── Staging & Review Deck ───────────────────────────────────
  stagedQuestions: StagedQuestion[];
  activeCardIndex: number;
  editingQuestionId: string | null;

  // ── Streaming & Status ──────────────────────────────────────
  isStreaming: boolean;
  streamProgress: { current: number; total: number };
  error: string | null;

  // ── Actions ─────────────────────────────────────────────────
  setContext: (context: Partial<StudioContext>) => void;
  setScope: (scope: Partial<StudioScope>) => void;
  setGenerationConfig: (config: Partial<GenerationConfig>) => void;
  setSelectedBook: (book: LibraryBook | null) => void;
  setAvailableBooks: (books: LibraryBook[]) => void;

  addStreamedQuestion: (
    q: Omit<StagedQuestion, "id" | "reviewStatus" | "linterReport"> & {
      id?: string;
    }
  ) => void;
  setStagedQuestions: (questions: StagedQuestion[]) => void;
  approveQuestion: (id: string) => void;
  discardQuestion: (id: string) => void;
  undoReview: (id: string) => void;
  updateStagedQuestion: (id: string, patch: Partial<StagedQuestion>) => void;

  setActiveCardIndex: (index: number) => void;
  setEditingQuestionId: (id: string | null) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setStreamProgress: (current: number, total: number) => void;
  setError: (error: string | null) => void;

  clearSession: () => void;
}

export const useStudioStore = create<StudioStoreState>()(
  persist(
    (set, get) => ({
      // ── Initial State ───────────────────────────────────────────
      context: {
        nodeId: null,
        boardId: null,
        boardName: null,
        boardCode: null,
        disciplineId: null,
        disciplineName: null,
        classLevel: 11,
        subjectId: null,
        subjectName: null,
        subjectScript: "LATIN",
        chapterId: null,
        chapterNumber: null,
        chapterTitle: null,
        topicId: null,
        topicNumber: null,
        topicTitle: null,
      },
      scope: {
        mode: "WHOLE",
        topicPrompt: "",
        startPage: 1,
        endPage: 10,
      },
      generationConfig: {
        count: 15,
        difficultyBias: "BALANCED",
        cognitiveBias: "MIXED",
      },
      selectedBookId: null,
      selectedBook: null,
      availableBooks: [],

      stagedQuestions: [],
      activeCardIndex: 0,
      editingQuestionId: null,

      isStreaming: false,
      streamProgress: { current: 0, total: 15 },
      error: null,

      // ── Mutators ────────────────────────────────────────────────
      setContext: (newContext) => {
        set((state) => ({
          context: { ...state.context, ...newContext },
        }));
      },

      setScope: (newScope) => {
        set((state) => ({
          scope: { ...state.scope, ...newScope },
        }));
      },

      setGenerationConfig: (newConfig) => {
        set((state) => ({
          generationConfig: { ...state.generationConfig, ...newConfig },
        }));
      },

      setSelectedBook: (book) => {
        set({
          selectedBook: book,
          selectedBookId: book?.id || null,
        });
      },

      setAvailableBooks: (books) => {
        set({ availableBooks: books });
        if (!get().selectedBook && books.length > 0) {
          set({ selectedBook: books[0], selectedBookId: books[0].id });
        }
      },

      addStreamedQuestion: (rawQ) => {
        const id =
          rawQ.id ||
          `staged-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const linterReport = lintMcq({
          prompt: rawQ.prompt,
          options: rawQ.options as string[],
          correct_option_index: rawQ.correct_option_index,
          explanation: rawQ.explanation,
        });

        const newQuestion: StagedQuestion = {
          ...rawQ,
          id,
          reviewStatus: "INBOX",
          linterReport,
        };

        set((state) => {
          const updated = [...state.stagedQuestions, newQuestion];
          return {
            stagedQuestions: updated,
            streamProgress: {
              ...state.streamProgress,
              current: updated.length,
            },
          };
        });
      },

      setStagedQuestions: (questions) => {
        set({ stagedQuestions: questions, activeCardIndex: 0 });
      },

      approveQuestion: (id) => {
        set((state) => {
          const updated = state.stagedQuestions.map((q) =>
            q.id === id
              ? { ...q, reviewStatus: "APPROVED" as ReviewStatus }
              : q
          );
          const nextIndex = Math.min(
            state.activeCardIndex + 1,
            updated.length - 1
          );
          return {
            stagedQuestions: updated,
            activeCardIndex: nextIndex,
            editingQuestionId: null,
          };
        });
      },

      discardQuestion: (id) => {
        set((state) => {
          const updated = state.stagedQuestions.map((q) =>
            q.id === id
              ? { ...q, reviewStatus: "DISCARDED" as ReviewStatus }
              : q
          );
          const nextIndex = Math.min(
            state.activeCardIndex + 1,
            updated.length - 1
          );
          return {
            stagedQuestions: updated,
            activeCardIndex: nextIndex,
            editingQuestionId: null,
          };
        });
      },

      undoReview: (id) => {
        set((state) => {
          const updated = state.stagedQuestions.map((q) =>
            q.id === id ? { ...q, reviewStatus: "INBOX" as ReviewStatus } : q
          );
          return { stagedQuestions: updated };
        });
      },

      updateStagedQuestion: (id, patch) => {
        set((state) => {
          const updated = state.stagedQuestions.map((q) => {
            if (q.id !== id) return q;
            const merged = { ...q, ...patch };
            const linterReport = lintMcq({
              prompt: merged.prompt,
              options: merged.options as string[],
              correct_option_index: merged.correct_option_index,
              explanation: merged.explanation,
            });
            return { ...merged, linterReport };
          });
          return { stagedQuestions: updated, editingQuestionId: null };
        });
      },

      setActiveCardIndex: (index) => {
        const total = get().stagedQuestions.length;
        if (total === 0) {
          set({ activeCardIndex: 0 });
          return;
        }
        const clamped = Math.max(0, Math.min(index, total - 1));
        set({ activeCardIndex: clamped, editingQuestionId: null });
      },

      setEditingQuestionId: (id) => {
        set({ editingQuestionId: id });
      },

      setIsStreaming: (isStreaming) => {
        set({ isStreaming });
      },

      setStreamProgress: (current, total) => {
        set({ streamProgress: { current, total } });
      },

      setError: (error) => {
        set({ error });
      },

      clearSession: () => {
        set({
          stagedQuestions: [],
          activeCardIndex: 0,
          editingQuestionId: null,
          error: null,
        });
      },
    }),
    {
      name: "pgc_studio_vault_store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stagedQuestions: state.stagedQuestions,
        generationConfig: state.generationConfig,
        scope: state.scope,
      }),
    }
  )
);
