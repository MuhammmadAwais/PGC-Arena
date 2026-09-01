import { z } from "zod";

export const generatedMcqSchema = z.object({
  prompt: z.string().min(5, "Question prompt is required and must be at least 5 characters."),
  options: z
    .array(z.string().min(1, "Option text cannot be empty"))
    .length(4, "Each MCQ must contain exactly 4 options"),
  correct_option_index: z
    .number()
    .int()
    .min(0)
    .max(3, "Correct option index must be between 0 and 3"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  cognitive_type: z.enum(["KNOWLEDGE", "CONCEPTUAL", "APPLICATION"]).default("CONCEPTUAL"),
  script_type: z.enum(["LATIN", "URDU_NASTALIQ", "ARABIC"]).default("LATIN"),
  time_limit_sec: z.number().int().min(10).max(60).default(15),
  explanation: z.string().nullable().optional(),
});

export const generatedMcqsArraySchema = z.array(generatedMcqSchema);

export const generateApiRequestSchema = z.object({
  pdfUrl: z.string().nullable().optional(),
  pdfBase64: z.string().nullable().optional(),
  startPage: z.number().int().min(1).nullable().optional(),
  endPage: z.number().int().min(1).nullable().optional(),
  topicPrompt: z.string().nullable().optional(),
  count: z.number().min(1).max(50).default(15),
  difficultyBias: z.enum(["BALANCED", "EASY", "MEDIUM", "HARD"]).default("BALANCED"),
  cognitiveBias: z.enum(["MIXED", "KNOWLEDGE", "CONCEPTUAL", "APPLICATION"]).default("MIXED"),
  contextData: z
    .object({
      boardName: z.string().nullable().optional(),
      classLevel: z.number().nullable().optional(),
      subjectName: z.string().nullable().optional(),
      chapterTitle: z.string().nullable().optional(),
      topicTitle: z.string().nullable().optional(),
      scriptType: z.enum(["LATIN", "URDU_NASTALIQ", "ARABIC"]).nullable().optional(),
    })
    .nullable()
    .optional(),
});
