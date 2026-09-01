import { z } from "zod";

export const presignRequestSchema = z.object({
  filename: z.string().min(1, "Filename is required"),
  contentType: z.string().default("application/pdf"),
  fileSizeBytes: z.number().positive().optional(),
});

export const bookAssignmentSchema = z.object({
  board_id: z.string().nullable().optional(),
  discipline_id: z.string().nullable().optional(),
  subject_id: z.string().nullable().optional(),
  class_level: z.number().int().min(1).max(12).nullable().optional(),
  curriculum_node_id: z.string().nullable().optional(),
});

export const saveBookRecordSchema = z.object({
  title: z.string().min(2, "Book title must be at least 2 characters"),
  file_url: z.string().url("Invalid file URL"),
  file_key: z.string().min(1, "File key is required"),
  file_size_bytes: z.number().nullable().optional(),
  page_count: z.number().int().positive().nullable().optional(),
  thumbnail_url: z.string().url().nullable().optional(),
  assignments: z.array(bookAssignmentSchema).default([]),
});

export const updateBookAssignmentsSchema = z.object({
  book_id: z.string().uuid("Invalid book ID"),
  assignments: z.array(bookAssignmentSchema),
});
