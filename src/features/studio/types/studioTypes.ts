import type { Difficulty, CognitiveType } from "@/features/questions/types/questionTypes";
import type { ScriptType } from "@/features/curriculum/types/curriculumTypes";
import type { LibraryBook } from "@/features/library/types/libraryTypes";

export interface LinterReport {
  isClean: boolean;
  flags: string[];
}

export type ReviewStatus = "INBOX" | "APPROVED" | "DISCARDED";

export interface StagedQuestion {
  id: string;
  topic_id?: string;
  prompt: string;
  options: [string, string, string, string] | string[];
  correct_option_index: 0 | 1 | 2 | 3 | number;
  difficulty: Difficulty;
  cognitive_type: CognitiveType;
  script_type: ScriptType;
  time_limit_sec: number;
  explanation: string | null;
  reviewStatus: ReviewStatus;
  linterReport: LinterReport;
}

export interface StudioContext {
  nodeId: string | null;
  boardId: string | null;
  boardName: string | null;
  boardCode: string | null;
  disciplineId: string | null;
  disciplineName: string | null;
  classLevel: number;
  subjectId: string | null;
  subjectName: string | null;
  subjectCode: string | null;
  subjectScript: ScriptType;
  chapterId: string | null;
  chapterNumber: number | null;
  chapterTitle: string | null;
  topicId: string | null;
  topicNumber: string | null;
  topicTitle: string | null;
}

export type ScopeMode = "WHOLE" | "TOPIC" | "PAGE_RANGE";

export interface StudioScope {
  mode: ScopeMode;
  topicPrompt: string;
  startPage: number;
  endPage: number;
}

export type DifficultyBias = "BALANCED" | "EASY" | "MEDIUM" | "HARD";
export type CognitiveBias = "MIXED" | "KNOWLEDGE" | "CONCEPTUAL" | "APPLICATION";

export interface GenerationConfig {
  count: number;
  difficultyBias: DifficultyBias;
  cognitiveBias: CognitiveBias;
}
