import { z } from "zod";

export const scriptTypeSchema = z.enum(["LATIN", "URDU_NASTALIQ", "ARABIC"]);
export const classLevelSchema = z.union([z.literal(11), z.literal(12)]);

// ── Board Schemas ───────────────────────────────────────────
export const createBoardSchema = z.object({
  name: z.string().min(3, "Board name must be at least 3 characters").max(100, "Board name too long"),
  code: z.string().min(2, "Board code must be at least 2 characters").max(20, "Board code too long").toUpperCase(),
  logo_url: z.string().url("Invalid logo URL").optional().nullable().or(z.literal("")),
  banner_url: z.string().url("Invalid banner URL").optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional().default(true),
});

export const updateBoardSchema = createBoardSchema.extend({
  id: z.string().uuid("Invalid Board ID"),
});

// ── Discipline Schemas ───────────────────────────────────────
export const createDisciplineSchema = z.object({
  name: z.string().min(2, "Discipline name must be at least 2 characters").max(100, "Discipline name too long"),
  code: z.string().min(2, "Discipline code must be at least 2 characters").max(20, "Discipline code too long").toUpperCase(),
  description: z.string().max(500, "Description too long").optional().nullable().or(z.literal("")),
  logo_url: z.string().url("Invalid emblem URL").optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional().default(true),
});

export const updateDisciplineSchema = createDisciplineSchema.extend({
  id: z.string().uuid("Invalid Discipline ID"),
});

// ── Subject Schemas ──────────────────────────────────────────
export const createSubjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters").max(100, "Subject name too long"),
  code: z.string().min(2, "Subject code must be at least 2 characters").max(20, "Subject code too long").toUpperCase(),
  script_type: scriptTypeSchema.default("LATIN"),
  textbook_cover_url: z.string().url("Invalid textbook cover URL").optional().nullable().or(z.literal("")),
  description: z.string().max(500, "Description too long").optional().nullable().or(z.literal("")),
  is_active: z.boolean().optional().default(true),
});

export const updateSubjectSchema = createSubjectSchema.extend({
  id: z.string().uuid("Invalid Subject ID"),
});

// ── Curriculum Node Mapping Schemas ──────────────────────────
export const assignSubjectSchema = z.object({
  board_id: z.string().uuid("Invalid Board ID"),
  discipline_id: z.string().uuid("Invalid Discipline ID"),
  subject_id: z.string().uuid("Invalid Subject ID"),
  class_level: classLevelSchema,
});

export const removeSubjectSchema = z.object({
  node_id: z.string().uuid("Invalid Node ID").optional(),
  board_id: z.string().uuid("Invalid Board ID").optional(),
  discipline_id: z.string().uuid("Invalid Discipline ID").optional(),
  subject_id: z.string().uuid("Invalid Subject ID").optional(),
  class_level: classLevelSchema.optional(),
}).refine((data) => data.node_id || (data.board_id && data.discipline_id && data.subject_id && data.class_level), {
  message: "Either node_id or (board_id, discipline_id, subject_id, class_level) must be provided",
});

// ── Generic Delete Schema with 2FA phrase confirmation ───────
export const deleteEntitySchema = z.object({
  id: z.string().uuid("Invalid ID"),
  confirmationPhrase: z.string().min(1, "Confirmation phrase required"),
});
