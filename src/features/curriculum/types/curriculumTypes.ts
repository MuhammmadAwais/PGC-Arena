export type ScriptType = "LATIN" | "URDU_NASTALIQ" | "ARABIC";
export type ClassLevel = 11 | 12;

export interface Board {
  id: string;
  name: string;
  code: string;
  logo_url: string | null;
  banner_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Discipline {
  id: string;
  name: string;
  code: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  script_type: ScriptType;
  textbook_cover_url: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CurriculumNode {
  id: string;
  board_id: string;
  discipline_id: string;
  subject_id: string;
  class_level: ClassLevel;
  subject: Subject;
  question_count: number;
}

export interface DisciplineWithNodes extends Discipline {
  nodes: CurriculumNode[];
}

export interface BoardWithDisciplines extends Board {
  disciplines: DisciplineWithNodes[];
}

export interface CurriculumStats {
  totalBoards: number;
  totalDisciplines: number;
  totalSubjects: number;
  totalNodes: number;
  totalQuestions: number;
}

export interface CurriculumDataResponse {
  success: boolean;
  boards: Board[];
  disciplines: Discipline[];
  subjects: Subject[];
  nodes: CurriculumNode[];
  boardContainers: BoardWithDisciplines[];
  stats: CurriculumStats;
  error?: string;
}

export interface CreateBoardInput {
  name: string;
  code: string;
  logo_url?: string | null;
  banner_url?: string | null;
  is_active?: boolean;
}

export interface UpdateBoardInput extends CreateBoardInput {
  id: string;
}

export interface CreateDisciplineInput {
  name: string;
  code: string;
  description?: string | null;
  logo_url?: string | null;
  is_active?: boolean;
}

export interface UpdateDisciplineInput extends CreateDisciplineInput {
  id: string;
}

export interface CreateSubjectInput {
  name: string;
  code: string;
  script_type: ScriptType;
  textbook_cover_url?: string | null;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateSubjectInput extends CreateSubjectInput {
  id: string;
}

export interface AssignSubjectInput {
  board_id: string;
  discipline_id: string;
  subject_id: string;
  class_level: ClassLevel;
}

export interface RemoveSubjectInput {
  node_id?: string;
  board_id?: string;
  discipline_id?: string;
  subject_id?: string;
  class_level?: ClassLevel;
}
