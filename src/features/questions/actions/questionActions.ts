"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
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
  CurriculumNodeVaultCard,
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
import type {
  ClassLevel,
  Board,
  Discipline,
  Subject,
  ScriptType,
} from "@/features/curriculum/types/curriculumTypes";

// ── 1. Fetch Curriculum Nodes Hub List with Question Counts ──────────
export async function getCurriculumNodeHubListAction(params?: {
  boardId?: string | null;
  disciplineId?: string | null;
  classLevel?: ClassLevel | null;
  search?: string | null;
}): Promise<{
  success: boolean;
  nodes: CurriculumNodeVaultCard[];
  boards: Board[];
  disciplines: Discipline[];
  error?: string;
}> {
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, nodes: [], boards: [], disciplines: [], error: auth.error };
  }

  try {
    // 1. Fetch Boards & Disciplines for filter bar
    const [{ data: boardsData }, { data: disciplinesData }] = await Promise.all([
      supabaseAdmin.from("boards").select("*").eq("is_active", true).order("name"),
      supabaseAdmin.from("disciplines").select("*").eq("is_active", true).order("name"),
    ]);

    const boards: Board[] = (boardsData || []).map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      logo_url: b.logo_url,
      banner_url: b.banner_url,
      is_active: b.is_active,
      created_at: b.created_at,
    }));

    const disciplines: Discipline[] = (disciplinesData || []).map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description,
      logo_url: d.logo_url,
      is_active: d.is_active,
      created_at: d.created_at,
    }));

    // 2. Query Curriculum Nodes with relations
    let query = supabaseAdmin
      .from("curriculum_nodes")
      .select(`
        id,
        class_level,
        board:boards (id, name, code, logo_url, banner_url, is_active, created_at),
        discipline:disciplines (id, name, code, description, logo_url, is_active, created_at),
        subject:subjects (id, name, code, script_type, textbook_cover_url, description, is_active, created_at)
      `)
      .order("class_level", { ascending: true });

    if (params?.boardId) {
      query = query.eq("board_id", params.boardId);
    }
    if (params?.disciplineId) {
      query = query.eq("discipline_id", params.disciplineId);
    }
    if (params?.classLevel) {
      query = query.eq("class_level", params.classLevel);
    }

    const { data: nodesRaw, error: nodeError } = await query;
    if (nodeError) throw nodeError;

    // 3. Aggregate Question & Chapter counts per node
    const { data: chaptersData, error: chapError } = await supabaseAdmin
      .from("chapters")
      .select(`
        id,
        curriculum_node_id,
        topics:topics (
          id,
          questions:questions (id)
        )
      `);

    if (chapError) throw chapError;

    const nodeStatsMap = new Map<string, { chapters: number; questions: number }>();

    (chaptersData || []).forEach((chap: any) => {
      const nodeId = chap.curriculum_node_id;
      if (!nodeId) return;

      const current = nodeStatsMap.get(nodeId) || { chapters: 0, questions: 0 };
      current.chapters += 1;

      if (Array.isArray(chap.topics)) {
        chap.topics.forEach((t: any) => {
          if (Array.isArray(t.questions)) {
            current.questions += t.questions.length;
          }
        });
      }

      nodeStatsMap.set(nodeId, current);
    });

    const nodes: CurriculumNodeVaultCard[] = (nodesRaw || [])
      .filter((n: any) => n.board && n.discipline && n.subject)
      .map((n: any) => {
        const stats = nodeStatsMap.get(n.id) || { chapters: 0, questions: 0 };
        return {
          curriculum_node_id: n.id,
          board: n.board as Board,
          discipline: n.discipline as Discipline,
          subject: {
            id: n.subject.id,
            name: n.subject.name,
            code: n.subject.code,
            script_type: n.subject.script_type as ScriptType,
            textbook_cover_url: n.subject.textbook_cover_url,
            description: n.subject.description,
            is_active: n.subject.is_active,
            created_at: n.subject.created_at,
          },
          class_level: n.class_level as ClassLevel,
          chapter_count: stats.chapters,
          question_count: stats.questions,
        };
      });

    // Client-side / In-memory search filter for subject name/code
    const filteredNodes = params?.search
      ? nodes.filter((n) => {
          const q = params.search!.toLowerCase();
          return (
            n.subject.name.toLowerCase().includes(q) ||
            n.subject.code.toLowerCase().includes(q) ||
            n.board.name.toLowerCase().includes(q) ||
            n.discipline.name.toLowerCase().includes(q)
          );
        })
      : nodes;

    return {
      success: true,
      nodes: filteredNodes,
      boards,
      disciplines,
    };
  } catch (err: any) {
    console.error("Failed to load curriculum node hub list:", err);
    return { success: false, nodes: [], boards: [], disciplines: [], error: err.message };
  }
}

// ── 2. Fetch Isolated Curriculum Node Vault Metadata & Tree ───────────
export async function getSubjectVaultData(
  curriculumNodeId: string
): Promise<SubjectVaultDataResponse> {
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    return {
      success: false,
      curriculum_node_id: curriculumNodeId,
      board: null,
      discipline: null,
      subject: null,
      classLevel: 11,
      chapters: [],
      stats: { totalChapters: 0, totalTopics: 0, totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0 },
      error: auth.error,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Fetch Curriculum Node with Board, Discipline, Subject (with fallback by subject_id)
    let nodeRaw: any = null;
    const { data: directNode } = await supabaseAdmin
      .from("curriculum_nodes")
      .select(`
        id,
        class_level,
        board:boards (id, name, code, logo_url, banner_url, is_active, created_at),
        discipline:disciplines (id, name, code, description, logo_url, is_active, created_at),
        subject:subjects (id, name, code, script_type, textbook_cover_url, description, is_active, created_at)
      `)
      .eq("id", curriculumNodeId)
      .maybeSingle();

    if (directNode) {
      nodeRaw = directNode;
    } else {
      // Fallback: check by subject_id
      const { data: fallbackNode } = await supabaseAdmin
        .from("curriculum_nodes")
        .select(`
          id,
          class_level,
          board:boards (id, name, code, logo_url, banner_url, is_active, created_at),
          discipline:disciplines (id, name, code, description, logo_url, is_active, created_at),
          subject:subjects (id, name, code, script_type, textbook_cover_url, description, is_active, created_at)
        `)
        .eq("subject_id", curriculumNodeId)
        .limit(1)
        .maybeSingle();

      if (fallbackNode) {
        nodeRaw = fallbackNode;
      }
    }

    if (!nodeRaw) {
      return {
        success: false,
        curriculum_node_id: curriculumNodeId,
        board: null,
        discipline: null,
        subject: null,
        classLevel: 11,
        chapters: [],
        stats: { totalChapters: 0, totalTopics: 0, totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0 },
        error: "Curriculum node not found.",
      };
    }

    const actualNodeId = nodeRaw.id;
    const board = nodeRaw.board as unknown as Board;
    const discipline = nodeRaw.discipline as unknown as Discipline;
    const rawSub: any = nodeRaw.subject;
    const subject: Subject = {
      id: rawSub.id,
      name: rawSub.name,
      code: rawSub.code,
      script_type: rawSub.script_type as ScriptType,
      textbook_cover_url: rawSub.textbook_cover_url,
      description: rawSub.description,
      is_active: rawSub.is_active,
      created_at: rawSub.created_at,
    };
    const classLevel = nodeRaw.class_level as ClassLevel;

    // 2. Fetch Chapters scoped strictly to this actualNodeId (or subject_id)
    const { data: chaptersRaw, error: chapError } = await supabaseAdmin
      .from("chapters")
      .select("*")
      .or(`curriculum_node_id.eq.${actualNodeId},subject_id.eq.${subject.id}`)
      .order("chapter_number", { ascending: true });

    if (chapError) throw chapError;

    const chapterIds = (chaptersRaw || []).map((c) => c.id);

    // 3. Fetch Topics for these chapters
    let topicsRaw: any[] = [];
    if (chapterIds.length > 0) {
      const { data: tData, error: topicError } = await supabaseAdmin
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
      const { data: qData, error: qError } = await supabaseAdmin
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
        curriculum_node_id: chap.curriculum_node_id || curriculumNodeId,
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
      curriculum_node_id: curriculumNodeId,
      board,
      discipline,
      subject,
      classLevel,
      chapters,
      stats,
    };
  } catch (err: any) {
    console.error("Failed to get curriculum node vault data:", err);
    return {
      success: false,
      curriculum_node_id: curriculumNodeId,
      board: null,
      discipline: null,
      subject: null,
      classLevel: 11,
      chapters: [],
      stats: { totalChapters: 0, totalTopics: 0, totalQuestions: 0, easyCount: 0, mediumCount: 0, hardCount: 0 },
      error: err.message || "Failed to load node vault.",
    };
  }
}

// ── 3. Fetch Paginated Questions for Curriculum Node ─────────────────
export async function getVaultQuestionsAction(params: {
  curriculumNodeId: string;
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
    curriculumNodeId,
    chapterId,
    topicId,
    page = 1,
    pageSize = 10,
    filters = {},
  } = params;

  try {
    // 1. Resolve Target Topic IDs
    let targetTopicIds: string[] = [];

    if (topicId) {
      targetTopicIds = [topicId];
    } else if (chapterId) {
      const { data: topicsData } = await supabaseAdmin
        .from("topics")
        .select("id")
        .eq("chapter_id", chapterId);
      targetTopicIds = (topicsData || []).map((t) => t.id);
    } else {
      // Find actual node and its subject ID
      let actualNodeId = curriculumNodeId;
      let subjectId: string | null = null;

      const { data: nodeData } = await supabaseAdmin
        .from("curriculum_nodes")
        .select("id, subject_id")
        .eq("id", curriculumNodeId)
        .maybeSingle();

      if (nodeData) {
        actualNodeId = nodeData.id;
        subjectId = nodeData.subject_id;
      } else {
        const { data: fallbackNode } = await supabaseAdmin
          .from("curriculum_nodes")
          .select("id, subject_id")
          .eq("subject_id", curriculumNodeId)
          .limit(1)
          .maybeSingle();
        if (fallbackNode) {
          actualNodeId = fallbackNode.id;
          subjectId = fallbackNode.subject_id;
        }
      }

      let orFilter = `curriculum_node_id.eq.${actualNodeId}`;
      if (subjectId) {
        orFilter += `,subject_id.eq.${subjectId}`;
      }

      const { data: chapsData } = await supabaseAdmin
        .from("chapters")
        .select("id")
        .or(orFilter);

      const chapIds = (chapsData || []).map((c) => c.id);
      if (chapIds.length > 0) {
        const { data: topicsData } = await supabaseAdmin
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
    let query = supabaseAdmin
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
        topic:topics (
          id,
          topic_number,
          title,
          chapter_id,
          chapter:chapters (
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
        topic: q.topic
          ? {
              id: q.topic.id,
              topic_number: q.topic.topic_number,
              title: q.topic.title,
              chapter_id: q.topic.chapter_id,
            }
          : undefined,
        chapter: q.topic?.chapter
          ? {
              id: q.topic.chapter.id,
              chapter_number: q.topic.chapter.chapter_number,
              title: q.topic.chapter.title,
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

// ── 4. Chapter CRUD Actions ───────────────────────────────────────
export async function createChapterAction(rawInput: CreateChapterInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = createChapterSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid chapter input" };
  }

  try {
    // Resolve subject_id and class_level from curriculum_node if not explicitly passed
    let subjectId = parsed.data.subject_id;
    let classLevel = parsed.data.class_level;

    if (!subjectId || !classLevel) {
      const { data: nodeData, error: nodeErr } = await supabaseAdmin
        .from("curriculum_nodes")
        .select("subject_id, class_level")
        .eq("id", parsed.data.curriculum_node_id)
        .maybeSingle();

      if (nodeErr || !nodeData) throw new Error("Referenced curriculum node not found.");
      subjectId = nodeData.subject_id;
      classLevel = nodeData.class_level as ClassLevel;
    }

    const { data, error } = await supabaseAdmin
      .from("chapters")
      .insert({
        curriculum_node_id: parsed.data.curriculum_node_id,
        subject_id: subjectId,
        class_level: classLevel,
        chapter_number: parsed.data.chapter_number,
        title: parsed.data.title,
        description: parsed.data.description || null,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `Chapter ${parsed.data.chapter_number} already exists for this syllabus.` };
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
    const updatePayload: any = {};
    if (parsed.data.chapter_number !== undefined) updatePayload.chapter_number = parsed.data.chapter_number;
    if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
    if (parsed.data.description !== undefined) updatePayload.description = parsed.data.description;
    if (parsed.data.is_active !== undefined) updatePayload.is_active = parsed.data.is_active;

    const { data, error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin.from("chapters").delete().eq("id", chapterId);
    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Chapter Error:", err);
    return { success: false, error: err.message || "Failed to delete chapter" };
  }
}

// ── 5. Topic CRUD Actions ─────────────────────────────────────────
export async function createTopicAction(rawInput: CreateTopicInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = createTopicSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid topic input" };
  }

  try {
    const { data, error } = await supabaseAdmin
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
    const updatePayload: any = {};
    if (parsed.data.topic_number !== undefined) updatePayload.topic_number = parsed.data.topic_number;
    if (parsed.data.title !== undefined) updatePayload.title = parsed.data.title;
    if (parsed.data.is_active !== undefined) updatePayload.is_active = parsed.data.is_active;

    const { data, error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin.from("topics").delete().eq("id", topicId);
    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Topic Error:", err);
    return { success: false, error: err.message || "Failed to delete topic" };
  }
}

// ── 6. MCQ Question CRUD Actions ───────────────────────────────────
export async function createQuestionAction(rawInput: CreateQuestionInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = createQuestionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid question input" };
  }

  try {
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
        is_active: parsed.data.is_active ?? true,
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

export async function duplicateQuestionAction(questionId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const { data: source, error: fetchErr } = await supabaseAdmin
      .from("questions")
      .select("*")
      .eq("id", questionId)
      .maybeSingle();

    if (fetchErr || !source) throw new Error("Question to duplicate not found.");

    const { data, error } = await supabaseAdmin
      .from("questions")
      .insert({
        topic_id: source.topic_id,
        prompt: `${source.prompt} (Copy)`,
        options: source.options,
        correct_option_index: source.correct_option_index,
        difficulty: source.difficulty,
        cognitive_type: source.cognitive_type,
        script_type: source.script_type,
        time_limit_sec: source.time_limit_sec,
        explanation: source.explanation,
        is_active: source.is_active,
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

export async function deleteQuestionAction(questionId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  try {
    const { error } = await supabaseAdmin.from("questions").delete().eq("id", questionId);
    if (error) throw error;

    revalidatePath("/admin/question-bank");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Question Error:", err);
    return { success: false, error: err.message || "Failed to delete question" };
  }
}

// ── 7. Bulk Operations ────────────────────────────────────────────
export async function bulkUpdateQuestionsAction(rawInput: BulkUpdateQuestionsInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) return { success: false, error: auth.error };

  const parsed = bulkUpdateQuestionsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid bulk input" };
  }

  const { question_ids, action, difficulty } = parsed.data;

  try {
    if (action === "DELETE") {
      const { error } = await supabaseAdmin
        .from("questions")
        .delete()
        .in("id", question_ids);

      if (error) throw error;
    } else if (action === "SET_DIFFICULTY" && difficulty) {
      const { error } = await supabaseAdmin
        .from("questions")
        .update({ difficulty })
        .in("id", question_ids);

      if (error) throw error;
    } else if (action === "ACTIVATE") {
      const { error } = await supabaseAdmin
        .from("questions")
        .update({ is_active: true })
        .in("id", question_ids);

      if (error) throw error;
    } else if (action === "DEACTIVATE") {
      const { error } = await supabaseAdmin
        .from("questions")
        .update({ is_active: false })
        .in("id", question_ids);

      if (error) throw error;
    }

    revalidatePath("/admin/question-bank");
    return { success: true, count: question_ids.length };
  } catch (err: any) {
    console.error("Bulk Action Error:", err);
    return { success: false, error: err.message || "Failed to perform bulk operation" };
  }
}
