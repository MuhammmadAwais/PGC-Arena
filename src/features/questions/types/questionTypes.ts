import type { Subject, ClassLevel, ScriptType } from "@/features/curriculum/types/curriculumTypes";

export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type CognitiveType = "KNOWLEDGE" | "CONCEPTUAL" | "APPLICATION";

export interface Chapter {
  id: string;
  subject_id: string;
  class_level: ClassLevel;
  chapter_number: number;
  title: string;
  description: string | null;
  question_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Topic {
  id: string;
  chapter_id: string;
  topic_number: string;
  title: string;
  question_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  prompt: string;
  options: [string, string, string, string] | string[];
  correct_option_index: 0 | 1 | 2 | 3 | number;
  difficulty: Difficulty;
  cognitive_type: CognitiveType;
  script_type: ScriptType;
  time_limit_sec: number;
  explanation: string | null;
  is_active: boolean;
  created_at: string;
  topic?: {
    id: string;
    topic_number: string;
    title: string;
    chapter_id: string;
  };
  chapter?: {
    id: string;
    chapter_number: number;
    title: string;
  };
}

export interface ChapterWithTopics extends Chapter {
  topics: Topic[];
}

export interface SubjectVaultStats {
  totalChapters: number;
  totalTopics: number;
  totalQuestions: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
}

export interface SubjectVaultDataResponse {
  success: boolean;
  subject: Subject | null;
  classLevel: ClassLevel;
  chapters: ChapterWithTopics[];
  stats: SubjectVaultStats;
  error?: string;
}

export interface QuestionFilterPayload {
  difficulty?: "ALL" | Difficulty;
  cognitiveType?: "ALL" | CognitiveType;
  script?: "ALL" | ScriptType;
  search?: string;
}

export interface PaginatedQuestionsResponse {
  success: boolean;
  questions: Question[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  error?: string;
}

export interface CreateChapterInput {
  subject_id: string;
  class_level: ClassLevel;
  chapter_number: number;
  title: string;
  description?: string | null;
  is_active?: boolean;
}

export interface UpdateChapterInput {
  id: string;
  chapter_number?: number;
  title?: string;
  description?: string | null;
  is_active?: boolean;
}

export interface CreateTopicInput {
  chapter_id: string;
  topic_number: string;
  title: string;
  is_active?: boolean;
}

export interface UpdateTopicInput {
  id: string;
  topic_number?: string;
  title?: string;
  is_active?: boolean;
}

export interface CreateQuestionInput {
  topic_id: string;
  prompt: string;
  options: [string, string, string, string] | string[];
  correct_option_index: 0 | 1 | 2 | 3 | number;
  difficulty: Difficulty;
  cognitive_type: CognitiveType;
  script_type: ScriptType;
  time_limit_sec?: number;
  explanation?: string | null;
  is_active?: boolean;
}

export interface UpdateQuestionInput extends CreateQuestionInput {
  id: string;
}

export interface BulkUpdateQuestionsInput {
  question_ids: string[];
  action: "SET_DIFFICULTY" | "ACTIVATE" | "DEACTIVATE" | "DELETE";
  difficulty?: Difficulty;
}
