"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin, requireAuth } from "@/lib/supabase/rbac";
import {
  createChapterSchema,
  updateChapterSchema,
  createTopicSchema,
  updateTopicSchema,
  createQuestionSchema,
  updateQuestionSchema,
  bulkUpdateQuestionsSchema,
} from "../schemas/questionSchemas";
import type {
  Chapter,
  Topic,
  Question,
  ChapterWithTopics,
  SubjectVaultDataResponse,
  PaginatedQuestionsResponse,
  QuestionFilterPayload,
  CreateChapterInput,
  UpdateChapterInput,
  CreateTopicInput,
  UpdateTopicInput,
  CreateQuestionInput,
  UpdateQuestionInput,
  BulkUpdateQuestionsInput,
  Difficulty,
  CognitiveType,
} from "../types/questionTypes";
import type { ClassLevel, Subject, ScriptType } from "@/features/curriculum/types/curriculumTypes";

// ── 1. Fetch Subject Vault Metadata & Tree ────────────────────────
export async function getSubjectVaultData(
  subjectId: string,
  classLevel: ClassLevel = 11
): Promise<SubjectVaultDataResponse> {
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    return {
      success: false,
      subject: null,
      classLevel,
      chapters: [],
      stats: { totalChapters: 0, totalTopics: 0, totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0 },
      error: auth.error,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Fetch Subject
    const { data: subjectRaw, error: subError } = await supabase
      .from("subjects")
      .select("*")
      .eq("id", subjectId)
      .maybeSingle();

    if (subError) throw subError;
    if (!subjectRaw) {
      return {
        success: false,
        subject: null,
        classLevel,
        chapters: [],
        stats: { totalChapters: 0, totalTopics: 0, totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0 },
        error: "Subject not found in curriculum bank.",
      };
    }

    const subject: Subject = {
      id: subjectRaw.id,
      name: subjectRaw.name,
      code: subjectRaw.code,
      script_type: subjectRaw.script_type as ScriptType,
      textbook_cover_url: subjectRaw.textbook_cover_url,
      description: subjectRaw.description,
      is_active: subjectRaw.is_active,
      created_at: subjectRaw.created_at,
    };

    // 2. Fetch Chapters for this subject and classLevel
    const { data: chaptersRaw, error: chapError } = await supabase
      .from("chapters")
      .select("*")
      .eq("subject_id", subjectId)
      .eq("class_level", classLevel)
      .order("chapter_number", { ascending: true });

    if (chapError) throw chapError;

    const chapterIds = (chaptersRaw || []).map((c) => c.id);

    // 3. Fetch Topics for these chapters
    let topicsRaw: any[] = [];
    if (chapterIds.length > 0) {
      const { data: tData, error: topicError } = await supabase
        .from("topics")
        .select("*")
        .in("chapter_id", chapterIds)
        .order("topic_number", { ascending: true });

      if (topicError) throw topicError;
      topicsRaw = tData || [];
    }

    const topicIds = topicsRaw.map((t) => t.id);

    // 4. Fetch Question Counts & Difficulty distribution
    let questionsRaw: any[] = [];
    if (topicIds.length > 0) {
      const { data: qData, error: qError } = await supabase
        .from("questions")
        .select("id, topic_id, difficulty")
        .in("topic_id", topicIds);

      if (qError) throw qError;
      questionsRaw = qData || [];
    }

    // Count questions per topic
    const topicCountMap = new Map<string, number>();
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;

    questionsRaw.forEach((q) => {
      topicCountMap.set(q.topic_id, (topicCountMap.get(q.topic_id) || 0) + 1);
      if (q.difficulty === "EASY") easyCount++;
      else if (q.difficulty === "MEDIUM") mediumCount++;
      else if (q.difficulty === "HARD") hardCount++;
    });

    // Structure Chapter -> Topics tree
    const chapters: ChapterWithTopics[] = (chaptersRaw || []).map((chap) => {
      const chapTopics: Topic[] = topicsRaw
        .filter((t) => t.chapter_id === chap.id)
        .map((t) => ({
          id: t.id,
          chapter_id: t.chapter_id,
          topic_number: t.topic_number,
          title: t.title,
          question_count: topicCountMap.get(t.id) || 0,
          is_active: t.is_active,
          created_at: t.created_at,
        }));

      const chapQuestionCount = chapTopics.reduce((sum, t) => sum + t.question_count, 0);

      return {
        id: chap.id,
        subject_id: chap.subject_id,
        class_level: chap.class_level as ClassLevel,
        chapter_number: chap.chapter_number,
        title: chap.title,
        description: chap.description,
        question_count: chapQuestionCount,
        is_active: chap.is_active,
        created_at: chap.created_at,
        topics: chapTopics,
      };
    });

    const stats = {
      totalChapters: chapters.length,
      totalTopics: topicsRaw.length,
      totalQuestions: questionsRaw.length,
      easyCount,
      mediumCount,
      hardCount,
    };

    return {
      success: true,
      subject,
      classLevel,
      chapters,
      stats,
    };
  } catch (err: any) {
    console.error("Failed to get subject vault data:", err);
    return {
      success: false,
      subject: null,
      classLevel,
      chapters: [],
      stats: { totalChapters: 0, totalTopics: 0, totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0 },
      error: err.message || "Failed to load subject vault.",
    };
  }
}

// ── 2. Fetch Paginated Questions ──────────────────────────────────
export async function getVaultQuestionsAction(params: {
  subjectId: string;
  classLevel: ClassLevel;
  chapterId?: string | null;
  topicId?: string | null;
  page?: number;
  pageSize?: number;
  filters?: QuestionFilterPayload;
}): Promise<PaginatedQuestionsResponse> {
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    return {
      success: false,
      questions: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      error: auth.error,
    };
  }

  const {
    subjectId,
    classLevel,
    chapterId,
    topicId,
    page = 1,
    pageSize = 10,
    filters = {},
  } = params;

  try {
    const supabase = await createClient();

    // 1. Resolve Target Topic IDs
    let targetTopicIds: string[] = [];

    if (topicId) {
      targetTopicIds = [topicId];
    } else if (chapterId) {
      const { data: topicsData } = await supabase
        .from("topics")
        .select("id")
        .eq("chapter_id", chapterId);
      targetTopicIds = (topicsData || []).map((t) => t.id);
    } else {
      // All chapters for subject & class
      const { data: chapsData } = await supabase
        .from("chapters")
        .select("id")
        .eq("subject_id", subjectId)
        .eq("class_level", classLevel);

      const chapIds = (chapsData || []).map((c) => c.id);
      if (chapIds.length > 0) {
        const { data: topicsData } = await supabase
          .from("topics")
          .select("id")
          .in("chapter_id", chapIds);
        targetTopicIds = (topicsData || []).map((t) => t.id);
      }
    }

    if (targetTopicIds.length === 0) {
      return {
        success: true,
        questions: [],
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
      };
    }

    // 2. Build Query
    let query = supabase
      .from("questions")
      .select(
        `
        id,
        topic_id,
        prompt,
        options,
        correct_option_index,
        difficulty,
        cognitive_type,
        script_type,
        time_limit_sec,
        explanation,
        is_active,
        created_at,
        topics:topic_id (
          id,
          topic_number,
          title,
          chapter_id,
          chapters:chapter_id (
            id,
            chapter_number,
            title
          )
        )
      `,
        { count: "exact" }
      )
      .in("topic_id", targetTopicIds);

    // Apply Filters
    if (filters.difficulty && filters.difficulty !== "ALL") {
      query = query.eq("difficulty", filters.difficulty);
    }
    if (filters.cognitiveType && filters.cognitiveType !== "ALL") {
      query = query.eq("cognitive_type", filters.cognitiveType);
    }
    if (filters.script && filters.script !== "ALL") {
      query = query.eq("script_type", filters.script);
    }
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      query = query.ilike("prompt", `%${q}%`);
    }

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data: questionsRaw, count, error } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const questions: Question[] = (questionsRaw || []).map((q: any) => {
      let optionsArray: string[] = [];
      if (Array.isArray(q.options)) {
        optionsArray = q.options;
      } else if (typeof q.options === "string") {
        try {
          optionsArray = JSON.parse(q.options);
        } catch {
          optionsArray = ["", "", "", ""];
        }
      }

      return {
        id: q.id,
        topic_id: q.topic_id,
        prompt: q.prompt,
        options: optionsArray as [string, string, string, string],
        correct_option_index: q.correct_option_index as 0 | 1 | 2 | 3,
        difficulty: q.difficulty as Difficulty,
        cognitive_type: q.cognitive_type as CognitiveType,
        script_type: q.script_type as ScriptType,
        time_limit_sec: q.time_limit_sec,
        explanation: q.explanation,
        is_active: q.is_active,
        created_at: q.created_at,
        topic: q.topics
          ? {
              id: q.topics.id,
              topic_number: q.topics.topic_number,
              title: q.topics.title,
              chapter_id: q.topics.chapter_id,
            }
          : undefined,
        chapter: q.topics?.chapters
          ? {
              id: q.topics.chapters.id,
              chapter_number: q.topics.chapters.chapter_number,
              title: q.topics.chapters.title,
            }
          : undefined,
      };
    });

    return {
      success: true,
      questions,
      page,
      pageSize,
      totalCount,
      totalPages,
    };
  } catch (err: any) {
    console.error("Failed to query questions:", err);
    return {
      success: false,
      questions: [],
      page,
      pageSize,
      totalCount: 0,
      totalPages: 0,
      error: err.message || "Failed to query questions.",
    };
  }
}

// ── 3. Chapter CRUD Actions ───────────────────────────────────────
export async function createChapterAction(rawInput: CreateChapterInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = createChapterSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid chapter input" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chapters")
      .insert({
        subject_id: parsed.data.subject_id,
        class_level: parsed.data.class_level,
        chapter_number: parsed.data.chapter_number,
        title: parsed.data.title,
        description: parsed.data.description || null,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `Chapter ${parsed.data.chapter_number} already exists for this class level.` };
      }
      throw error;
    }

    revalidatePath("/admin/question-bank");
    return { success: true, chapter: data };
  } catch (err: any) {
    console.error("Create Chapter Error:", err);
    return { success: false, error: err.message || "Failed to create chapter" };
  }
}

export async function updateChapterAction(rawInput: UpdateChapterInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = updateChapterSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid chapter input" };
  }

  try {
    const supabase = await createClient();
    const updatePayload: any = {};
    if (parsed.data.chapter_number !== undefined) updatePayload.chapter_number = parsed.data.chapter_number;
    if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
    if (parsed.data.is_active !== undefined) updatePayload.is_active = parsed.data.is_active;

    const { data, error } = await supabase
      .from("chapters")
      .update(updatePayload)
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true, chapter: data };
  } catch (err: any) {
    console.error("Update Chapter Error:", err);
    return { success: false, error: err.message || "Failed to update chapter" };
  }
}

export async function deleteChapterAction(chapterId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("chapters").delete().eq("id", chapterId);
    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Chapter Error:", err);
    return { success: false, error: err.message || "Failed to delete chapter" };
  }
}

// ── 4. Topic CRUD Actions ─────────────────────────────────────────
export async function createTopicAction(rawInput: CreateTopicInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = createTopicSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid topic input" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("topics")
      .insert({
        chapter_id: parsed.data.chapter_id,
        topic_number: parsed.data.topic_number,
        title: parsed.data.title,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `Topic ${parsed.data.topic_number} already exists in this chapter.` };
      }
      throw error;
    }

    revalidatePath("/admin/question-bank");
    return { success: true, topic: data };
  } catch (err: any) {
    console.error("Create Topic Error:", err);
    return { success: false, error: err.message || "Failed to create topic" };
  }
}

export async function updateTopicAction(rawInput: UpdateTopicInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = updateTopicSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid topic input" };
  }

  try {
    const supabase = await createClient();
    const updatePayload: any = {};
    if (parsed.data.topic_number !== undefined) updatePayload.topic_number = parsed.data.topic_number;
    if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
    if (parsed.data.is_active !== undefined) updatePayload.is_active = parsed.data.is_active;

    const { data, error } = await supabase
      .from("topics")
      .update(updatePayload)
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true, topic: data };
  } catch (err: any) {
    console.error("Update Topic Error:", err);
    return { success: false, error: err.message || "Failed to update topic" };
  }
}

export async function deleteTopicAction(topicId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("topics").delete().eq("id", topicId);
    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Topic Error:", err);
    return { success: false, error: err.message || "Failed to delete topic" };
  }
}

// ── 5. Question CRUD Actions ──────────────────────────────────────
export async function createQuestionAction(rawInput: CreateQuestionInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = createQuestionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid question input" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .insert({
        topic_id: parsed.data.topic_id,
        prompt: parsed.data.prompt,
        options: parsed.data.options,
        correct_option_index: parsed.data.correct_option_index,
        difficulty: parsed.data.difficulty,
        cognitive_type: parsed.data.cognitive_type,
        script_type: parsed.data.script_type,
        time_limit_sec: parsed.data.time_limit_sec,
        explanation: parsed.data.explanation || null,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true, question: data };
  } catch (err: any) {
    console.error("Create Question Error:", err);
    return { success: false, error: err.message || "Failed to create question" };
  }
}

export async function updateQuestionAction(rawInput: UpdateQuestionInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = updateQuestionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid question input" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("questions")
      .update({
        topic_id: parsed.data.topic_id,
        prompt: parsed.data.prompt,
        options: parsed.data.options,
        correct_option_index: parsed.data.correct_option_index,
        difficulty: parsed.data.difficulty,
        cognitive_type: parsed.data.cognitive_type,
        script_type: parsed.data.script_type,
        time_limit_sec: parsed.data.time_limit_sec,
        explanation: parsed.data.explanation || null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true, question: data };
  } catch (err: any) {
    console.error("Update Question Error:", err);
    return { success: false, error: err.message || "Failed to update question" };
  }
}

export async function deleteQuestionAction(questionId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("questions").delete().eq("id", questionId);
    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Question Error:", err);
    return { success: false, error: err.message || "Failed to delete question" };
  }
}

export async function duplicateQuestionAction(questionId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const supabase = await createClient();
    const { data: original, error: fetchErr } = await supabase
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .single();

    if (fetchErr || !original) throw new Error("Original question not found");

    const { data, error } = await supabase
      .from("questions")
      .insert({
        topic_id: original.topic_id,
        prompt: `${original.prompt} (Copy)`,
        options: original.options,
        correct_option_index: original.correct_option_index,
        difficulty: original.difficulty,
        cognitive_type: original.cognitive_type,
        script_type: original.script_type,
        time_limit_sec: original.time_limit_sec,
        explanation: original.explanation,
        is_active: original.is_active,
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true, question: data };
  } catch (err: any) {
    console.error("Duplicate Question Error:", err);
    return { success: false, error: err.message || "Failed to duplicate question" };
  }
}

// ── 6. Bulk Update Action ─────────────────────────────────────────
export async function bulkUpdateQuestionsAction(rawInput: BulkUpdateQuestionsInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = bulkUpdateQuestionsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid bulk update request" };
  }

  try {
    const supabase = await createClient();
    const { question_ids, action, difficulty } = parsed.data;

    if (action === "DELETE") {
      const { error } = await supabase.from("questions").delete().in("id", question_ids);
      if (error) throw error;
    } else if (action === "ACTIVATE") {
      const { error } = await supabase.from("questions").update({ is_active: true }).in("id", question_ids);
      if (error) throw error;
    } else if (action === "DEACTIVATE") {
      const { error } = await supabase.from("questions").update({ is_active: false }).in("id", question_ids);
      if (error) throw error;
    } else if (action === "SET_DIFFICULTY" && difficulty) {
      const { error } = await supabase.from("questions").update({ difficulty }).in("id", question_ids);
      if (error) throw error;
    }

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Bulk Update Questions Error:", err);
    return { success: false, error: err.message || "Failed to execute bulk update" };
  }
}
