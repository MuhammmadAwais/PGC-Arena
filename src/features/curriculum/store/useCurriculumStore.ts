import { create } from "zustand";
import type {
  Board,
  Discipline,
  Subject,
  ClassLevel,
  CurriculumDataResponse,
  BoardWithDisciplines,
} from "../types/curriculumTypes";
import { getCurriculumData } from "../actions/curriculumActions";

export type DeletableCurriculumEntity = "board" | "discipline" | "subject" | "node";

export interface AssignSubjectTarget {
  boardId: string;
  boardName: string;
  disciplineId: string;
  disciplineName: string;
  classLevel: ClassLevel;
}

export interface DeleteModalState {
  isOpen: boolean;
  entityType: DeletableCurriculumEntity;
  entityId: string;
  entityName: string;
  extraData?: {
    boardId?: string;
    disciplineId?: string;
    subjectId?: string;
    classLevel?: ClassLevel;
  };
}

interface CurriculumStoreState {
  // ── Data & Filters ──────────────────────────────────────────
  selectedClass: ClassLevel;
  searchQuery: string;
  curriculumData: CurriculumDataResponse | null;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;

  // ── Modal States ────────────────────────────────────────────
  isCreateBoardOpen: boolean;
  editBoardData: Board | null;

  isCreateDisciplineOpen: boolean;
  editDisciplineData: Discipline | null;

  isCreateSubjectOpen: boolean;
  editSubjectData: Subject | null;

  assignSubjectTarget: AssignSubjectTarget | null;
  deleteModalData: DeleteModalState;

  // ── Actions ─────────────────────────────────────────────────
  setSelectedClass: (classLevel: ClassLevel) => void;
  setSearchQuery: (query: string) => void;
  fetchCurriculum: (forceRefresh?: boolean) => Promise<void>;

  // Board Modal controls
  openCreateBoard: () => void;
  closeCreateBoard: () => void;
  openEditBoard: (board: Board) => void;
  closeEditBoard: () => void;

  // Discipline Modal controls
  openCreateDiscipline: () => void;
  closeCreateDiscipline: () => void;
  openEditDiscipline: (discipline: Discipline) => void;
  closeEditDiscipline: () => void;

  // Subject Modal controls
  openCreateSubject: () => void;
  closeCreateSubject: () => void;
  openEditSubject: (subject: Subject) => void;
  closeEditSubject: () => void;

  // Assign Subject Modal controls
  openAssignSubject: (target: AssignSubjectTarget) => void;
  closeAssignSubject: () => void;

  // Delete Confirmation Modal controls
  openDeleteModal: (
    entityType: DeletableCurriculumEntity,
    entityId: string,
    entityName: string,
    extraData?: DeleteModalState["extraData"]
  ) => void;
  closeDeleteModal: () => void;
}

export const useCurriculumStore = create<CurriculumStoreState>((set, get) => ({
  // ── Initial State ───────────────────────────────────────────
  selectedClass: 11,
  searchQuery: "",
  curriculumData: null,
  isLoading: false,
  isLoaded: false,
  error: null,

  isCreateBoardOpen: false,
  editBoardData: null,

  isCreateDisciplineOpen: false,
  editDisciplineData: null,

  isCreateSubjectOpen: false,
  editSubjectData: null,

  assignSubjectTarget: null,
  deleteModalData: {
    isOpen: false,
    entityType: "board",
    entityId: "",
    entityName: "",
  },

  // ── Data Actions ────────────────────────────────────────────
  setSelectedClass: (classLevel: ClassLevel) => {
    if (get().selectedClass === classLevel) return;
    set({ selectedClass: classLevel });
    get().fetchCurriculum(true);
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  fetchCurriculum: async (forceRefresh = false) => {
    const { isLoaded, isLoading, selectedClass } = get();
    if (isLoading) return;
    if (isLoaded && !forceRefresh) return;

    set({ isLoading: true, error: null });

    try {
      const res = await getCurriculumData(selectedClass);
      if (!res.success) {
        set({ error: res.error || "Failed to load curriculum", isLoading: false, isLoaded: true });
        return;
      }

      set({
        curriculumData: res,
        isLoading: false,
        isLoaded: true,
        error: null,
      });
    } catch (err: any) {
      set({
        error: err.message || "An unexpected error occurred while fetching curriculum",
        isLoading: false,
        isLoaded: true,
      });
    }
  },

  // ── Modal Handlers ──────────────────────────────────────────
  openCreateBoard: () => set({ isCreateBoardOpen: true, editBoardData: null }),
  closeCreateBoard: () => set({ isCreateBoardOpen: false, editBoardData: null }),

  openEditBoard: (board: Board) => set({ isCreateBoardOpen: true, editBoardData: board }),
  closeEditBoard: () => set({ isCreateBoardOpen: false, editBoardData: null }),

  openCreateDiscipline: () => set({ isCreateDisciplineOpen: true, editDisciplineData: null }),
  closeCreateDiscipline: () => set({ isCreateDisciplineOpen: false, editDisciplineData: null }),

  openEditDiscipline: (discipline: Discipline) =>
    set({ isCreateDisciplineOpen: true, editDisciplineData: discipline }),
  closeEditDiscipline: () => set({ isCreateDisciplineOpen: false, editDisciplineData: null }),

  openCreateSubject: () => set({ isCreateSubjectOpen: true, editSubjectData: null }),
  closeCreateSubject: () => set({ isCreateSubjectOpen: false, editSubjectData: null }),

  openEditSubject: (subject: Subject) => set({ isCreateSubjectOpen: true, editSubjectData: subject }),
  closeEditSubject: () => set({ isCreateSubjectOpen: false, editSubjectData: null }),

  openAssignSubject: (target: AssignSubjectTarget) => set({ assignSubjectTarget: target }),
  closeAssignSubject: () => set({ assignSubjectTarget: null }),

  openDeleteModal: (entityType, entityId, entityName, extraData) =>
    set({
      deleteModalData: {
        isOpen: true,
        entityType,
        entityId,
        entityName,
        extraData,
      },
    }),
  closeDeleteModal: () =>
    set({
      deleteModalData: {
        isOpen: false,
        entityType: "board",
        entityId: "",
        entityName: "",
        extraData: undefined,
      },
    }),
}));
