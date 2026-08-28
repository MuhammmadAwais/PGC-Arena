import { z } from "zod";

export const difficultySchema = z.enum(["EASY", "MEDIUM", "HARD"]);
export const cognitiveTypeSchema = z.enum(["KNOWLEDGE", "CONCEPTUAL", "APPLICATION"]);
export const scriptTypeSchema = z.enum(["LATIN", "URDU_NASTALIQ", "ARABIC"]);
export const classLevelSchema = z.union([z.literal(11), z.literal(12)]);

// ── Chapter Schemas ──────────────────────────────────────────
export const createChapterSchema = z.object({
  subject_id: z.string().uuid("Invalid Subject ID"),
  class_level: classLevelSchema,
  chapter_number: z.coerce.number().min(1, "Chapter number must be at least 1"),
  title: z.string().min(2, "Chapter title must be at least 2 characters").max(150, "Title too long"),
  description: z.string().max(500, "Description too long").optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional().default(true),
});

export const updateChapterSchema = z.object({
  id: z.string().uuid("Invalid Chapter ID"),
  chapter_number: z.coerce.number().min(1).optional(),
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(500).optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional(),
});

// ── Topic Schemas ────────────────────────────────────────────
export const createTopicSchema = z.object({
  chapter_id: z.string().uuid("Invalid Chapter ID"),
  topic_number: z.string().min(1, "Topic number required").max(20),
  title: z.string().min(2, "Topic title must be at least 2 characters").max(150, "Title too long"),
  is_active: z.boolean().optional().default(true),
});

export const updateTopicSchema = z.object({
  id: z.string().uuid("Invalid Topic ID"),
  topic_number: z.string().min(1).max(20).optional(),
  title: z.string().min(2).max(150).optional(),
  is_active: z.boolean().optional(),
});

// ── Question Schemas ─────────────────────────────────────────
export const createQuestionSchema = z.object({
  topic_id: z.string().uuid("Invalid Topic ID"),
  prompt: z.string().min(5, "Question prompt must be at least 5 characters"),
  options: z
    .array(z.string().min(1, "Option text cannot be empty"))
    .length(4, "Exactly 4 options are required"),
  correct_option_index: z.coerce.number().min(0).max(3, "Correct option index must be 0, 1, 2, or 3"),
  difficulty: difficultySchema.default("MEDIUM"),
  cognitive_type: cognitiveTypeSchema.default("CONCEPTUAL"),
  script_type: scriptTypeSchema.default("LATIN"),
  time_limit_sec: z.coerce.number().min(5).max(120).default(15),
  explanation: z.string().max(1000).optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional().default(true),
});

export const updateQuestionSchema = createQuestionSchema.extend({
  id: z.string().uuid("Invalid Question ID"),
});

// ── Bulk Actions Schema ──────────────────────────────────────
export const bulkUpdateQuestionsSchema = z.object({
  question_ids: z.array(z.string().uuid("Invalid Question ID")).min(1, "At least one question must be selected"),
  action: z.enum(["SET_DIFFICULTY", "ACTIVATE", "DEACTIVATE", "DELETE"]),
  difficulty: difficultySchema.optional(),
});
