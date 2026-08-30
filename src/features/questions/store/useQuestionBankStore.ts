import { create } from "zustand";
import type {
  Chapter,
  Topic,
  Question,
  ChapterWithTopics,
  Difficulty,
  CognitiveType,
  QuestionFilterPayload,
  SubjectVaultDataResponse,
} from "../types/questionTypes";
import type { ClassLevel, ScriptType } from "@/features/curriculum/types/curriculumTypes";
import {
  getSubjectVaultData,
  getVaultQuestionsAction,
} from "../actions/questionActions";

export type DeletableQuestionEntity = "chapter" | "topic" | "question";

export interface DeleteQuestionModalState {
  isOpen: boolean;
  entityType: DeletableQuestionEntity;
  entityId: string;
  entityName: string;
}

interface QuestionBankStoreState {
  // ── Hierarchy & Selection ───────────────────────────────────
  curriculumNodeId: string | null;
  vaultData: SubjectVaultDataResponse | null;
  activeChapterId: string | null;
  activeTopicId: string | null;

  // ── Questions & Pagination ──────────────────────────────────
  questions: Question[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  searchQuery: string;
  filters: {
    difficulty: "ALL" | Difficulty;
    cognitiveType: "ALL" | CognitiveType;
    script: "ALL" | ScriptType;
  };
  viewMode: "cards" | "compact-table";
  selectedQuestionIds: string[];

  // ── Loading & Errors ────────────────────────────────────────
  isLoadingVault: boolean;
  isLoadingQuestions: boolean;
  error: string | null;

  // ── Modals ──────────────────────────────────────────────────
  isCreateChapterOpen: boolean;
  editChapterData: Chapter | null;

  isCreateTopicOpen: boolean;
  editTopicData: Topic | null;
  targetChapterForTopic: ChapterWithTopics | null;

  isCreateEditMcqOpen: boolean;
  editMcqData: Question | null;

  deleteModalData: DeleteQuestionModalState;

  // ── Actions ─────────────────────────────────────────────────
  initNodeVault: (curriculumNodeId: string) => Promise<void>;
  setActiveChapter: (chapterId: string | null) => void;
  setActiveTopic: (topicId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setDifficultyFilter: (difficulty: "ALL" | Difficulty) => void;
  setCognitiveFilter: (cognitiveType: "ALL" | CognitiveType) => void;
  setScriptFilter: (script: "ALL" | ScriptType) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setViewMode: (mode: "cards" | "compact-table") => void;

  // Batch Selection
  toggleSelectQuestion: (questionId: string) => void;
  selectAllQuestions: () => void;
  clearQuestionSelection: () => void;

  // Data Refresh
  fetchVaultData: () => Promise<void>;
  fetchQuestions: () => Promise<void>;

  // Modal Handlers
  openCreateChapter: () => void;
  closeCreateChapter: () => void;
  openEditChapter: (chapter: Chapter) => void;
  closeEditChapter: () => void;

  openCreateTopic: (chapter?: ChapterWithTopics) => void;
  closeCreateTopic: () => void;
  openEditTopic: (topic: Topic) => void;
  closeEditTopic: () => void;

  openCreateMcq: () => void;
  closeCreateMcq: () => void;
  openEditMcq: (question: Question) => void;
  closeEditMcq: () => void;

  openDeleteModal: (
    entityType: DeletableQuestionEntity,
    entityId: string,
    entityName: string
  ) => void;
  closeDeleteModal: () => void;
}

export const useQuestionBankStore = create<QuestionBankStoreState>((set, get) => ({
  // ── Initial State ───────────────────────────────────────────
  curriculumNodeId: null,
  vaultData: null,
  activeChapterId: null,
  activeTopicId: null,

  questions: [],
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
  searchQuery: "",
  filters: {
    difficulty: "ALL",
    cognitiveType: "ALL",
    script: "ALL",
  },
  viewMode: "cards",
  selectedQuestionIds: [],

  isLoadingVault: false,
  isLoadingQuestions: false,
  error: null,

  isCreateChapterOpen: false,
  editChapterData: null,

  isCreateTopicOpen: false,
  editTopicData: null,
  targetChapterForTopic: null,

  isCreateEditMcqOpen: false,
  editMcqData: null,

  deleteModalData: {
    isOpen: false,
    entityType: "question",
    entityId: "",
    entityName: "",
  },

  // ── Core Navigation & Init ──────────────────────────────────
  initNodeVault: async (nodeId: string) => {
    set({
      curriculumNodeId: nodeId,
      activeChapterId: null,
      activeTopicId: null,
      selectedQuestionIds: [],
      error: null,
    });
    await get().fetchVaultData();
    await get().fetchQuestions();
  },

  setActiveChapter: (chapterId: string | null) => {
    set({ activeChapterId: chapterId, activeTopicId: null, pagination: { ...get().pagination, page: 1 } });
    get().fetchQuestions();
  },

  setActiveTopic: (topicId: string | null) => {
    set({ activeTopicId: topicId, pagination: { ...get().pagination, page: 1 } });
    get().fetchQuestions();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query, pagination: { ...get().pagination, page: 1 } });
    get().fetchQuestions();
  },

  setDifficultyFilter: (difficulty: "ALL" | Difficulty) => {
    set({
      filters: { ...get().filters, difficulty },
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchQuestions();
  },

  setCognitiveFilter: (cognitiveType: "ALL" | CognitiveType) => {
    set({
      filters: { ...get().filters, cognitiveType },
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchQuestions();
  },

  setScriptFilter: (script: "ALL" | ScriptType) => {
    set({
      filters: { ...get().filters, script },
      pagination: { ...get().pagination, page: 1 },
    });
    get().fetchQuestions();
  },

  setPage: (page: number) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchQuestions();
  },

  setPageSize: (pageSize: number) => {
    set({ pagination: { ...get().pagination, pageSize, page: 1 } });
    get().fetchQuestions();
  },

  setViewMode: (mode: "cards" | "compact-table") => {
    set({ viewMode: mode });
  },

  // ── Batch Selection ─────────────────────────────────────────
  toggleSelectQuestion: (questionId: string) => {
    const current = get().selectedQuestionIds;
    if (current.includes(questionId)) {
      set({ selectedQuestionIds: current.filter((id) => id !== questionId) });
    } else {
      set({ selectedQuestionIds: [...current, questionId] });
    }
  },

  selectAllQuestions: () => {
    const allIds = get().questions.map((q) => q.id);
    set({ selectedQuestionIds: allIds });
  },

  clearQuestionSelection: () => {
    set({ selectedQuestionIds: [] });
  },

  // ── Data Fetching ───────────────────────────────────────────
  fetchVaultData: async () => {
    const { curriculumNodeId } = get();
    if (!curriculumNodeId) return;

    set({ isLoadingVault: true, error: null });

    try {
      const res = await getSubjectVaultData(curriculumNodeId);
      if (!res.success) {
        set({ error: res.error || "Failed to load node vault", isLoadingVault: false });
        return;
      }
      set({ vaultData: res, isLoadingVault: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load vault metadata", isLoadingVault: false });
    }
  },

  fetchQuestions: async () => {
    const {
      curriculumNodeId,
      activeChapterId,
      activeTopicId,
      searchQuery,
      filters,
      pagination,
    } = get();

    if (!curriculumNodeId) return;

    set({ isLoadingQuestions: true });

    try {
      const res = await getVaultQuestionsAction({
        curriculumNodeId,
        chapterId: activeChapterId,
        topicId: activeTopicId,
        page: pagination.page,
        pageSize: pagination.pageSize,
        filters: {
          search: searchQuery,
          difficulty: filters.difficulty,
          cognitiveType: filters.cognitiveType,
          script: filters.script,
        },
      });

      if (res.success) {
        set({
          questions: res.questions,
          pagination: {
            page: res.page,
            pageSize: res.pageSize,
            totalCount: res.totalCount,
            totalPages: res.totalPages,
          },
          isLoadingQuestions: false,
        });
      } else {
        set({ isLoadingQuestions: false, error: res.error });
      }
    } catch (err: any) {
      set({ isLoadingQuestions: false, error: err.message });
    }
  },

  // ── Modals ──────────────────────────────────────────────────
  openCreateChapter: () => set({ isCreateChapterOpen: true, editChapterData: null }),
  closeCreateChapter: () => set({ isCreateChapterOpen: false, editChapterData: null }),
  openEditChapter: (chapter: Chapter) => set({ isCreateChapterOpen: true, editChapterData: chapter }),
  closeEditChapter: () => set({ isCreateChapterOpen: false, editChapterData: null }),

  openCreateTopic: (chapter?: ChapterWithTopics) =>
    set({
      isCreateTopicOpen: true,
      editTopicData: null,
      targetChapterForTopic:
        chapter ||
        get().vaultData?.chapters.find((c) => c.id === get().activeChapterId) ||
        get().vaultData?.chapters[0] ||
        null,
    }),
  closeCreateTopic: () =>
    set({ isCreateTopicOpen: false, editTopicData: null, targetChapterForTopic: null }),
  openEditTopic: (topic: Topic) =>
    set({ isCreateTopicOpen: true, editTopicData: topic }),
  closeEditTopic: () => set({ isCreateTopicOpen: false, editTopicData: null }),

  openCreateMcq: () => set({ isCreateEditMcqOpen: true, editMcqData: null }),
  closeCreateMcq: () => set({ isCreateEditMcqOpen: false, editMcqData: null }),
  openEditMcq: (question: Question) =>
    set({ isCreateEditMcqOpen: true, editMcqData: question }),
  closeEditMcq: () => set({ isCreateEditMcqOpen: false, editMcqData: null }),

  openDeleteModal: (entityType, entityId, entityName) =>
    set({
      deleteModalData: {
        isOpen: true,
        entityType,
        entityId,
        entityName,
      },
    }),
  closeDeleteModal: () =>
    set({
      deleteModalData: {
        isOpen: false,
        entityType: "question",
        entityId: "",
        entityName: "",
      },
    }),
}));
