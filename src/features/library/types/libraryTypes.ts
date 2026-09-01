import type { Board, Discipline, Subject, ClassLevel } from "@/features/curriculum/types/curriculumTypes";

export interface BookAssignment {
  id: string;
  book_id: string;
  curriculum_node_id: string | null;
  board_id: string | null;
  discipline_id: string | null;
  subject_id: string | null;
  class_level: number | null;
  created_at: string;
  board?: Board;
  discipline?: Discipline;
  subject?: Subject;
}

export interface LibraryBook {
  id: string;
  title: string;
  file_url: string;
  file_key: string;
  file_size_bytes: number | null;
  page_count: number | null;
  thumbnail_url: string | null;
  created_at: string;
  assignments: BookAssignment[];
}

export interface BookAssignmentPayload {
  board_id?: string | null;
  discipline_id?: string | null;
  subject_id?: string | null;
  class_level?: number | null;
  curriculum_node_id?: string | null;
}

export interface CurriculumNodeDetails {
  id: string;
  class_level: number;
  board_id: string;
  board_name: string;
  board_code: string;
  discipline_id: string;
  discipline_name: string;
  discipline_code: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
}

export interface SaveBookRecordInput {
  title: string;
  file_url: string;
  file_key: string;
  file_size_bytes?: number | null;
  page_count?: number | null;
  thumbnail_url?: string | null;
  assignments: BookAssignmentPayload[];
}
