"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/supabase/rbac";
import type { StagedQuestion } from "../types/studioTypes";

/**
 * Commits approved questions from the AI Studio Staging area directly into the public.questions vault.
 * Slices into safe batches of 20 for bulletproof transaction stability.
 */
export async function commitApprovedQuestionsAction(
  topicId: string,
  questions: StagedQuestion[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, count: 0, error: auth.error };
  }

  if (!topicId) {
    return {
      success: false,
      count: 0,
      error: "Target topic ID is required for commit.",
    };
  }

  const approved = questions.filter((q) => q.reviewStatus === "APPROVED");
  if (approved.length === 0) {
    return {
      success: false,
      count: 0,
      error: "No approved questions to commit.",
    };
  }

  try {
    const rowsToInsert = approved.map((q) => ({
      topic_id: topicId,
      prompt: q.prompt,
      options: q.options,
      correct_option_index: q.correct_option_index,
      difficulty: q.difficulty,
      cognitive_type: q.cognitive_type,
      script_type: q.script_type,
      time_limit_sec: q.time_limit_sec || 15,
      explanation: q.explanation || null,
      is_active: true,
    }));

    // Batch insert in chunks of 20
    const CHUNK_SIZE = 20;
    let committedCount = 0;

    for (let i = 0; i < rowsToInsert.length; i += CHUNK_SIZE) {
      const chunk = rowsToInsert.slice(i, i + CHUNK_SIZE);
      const { error } = await supabaseAdmin.from("questions").insert(chunk);

      if (error) throw error;
      committedCount += chunk.length;
    }

    revalidatePath("/admin/question-bank");
    return { success: true, count: committedCount };
  } catch (err: any) {
    console.error("Commit Questions Error:", err);
    return {
      success: false,
      count: 0,
      error: err.message || "Failed to commit questions to database vault.",
    };
  }
}

/**
 * Fetches chapters and topics for a curriculum node.
 */
export async function getNodeChaptersAndTopicsAction(
  nodeId: string
): Promise<{
  success: boolean;
  chapters: Array<{
    id: string;
    title: string;
    chapter_number: number;
    topics: Array<{
      id: string;
      title: string;
      topic_number: number;
    }>;
  }>;
  error?: string;
}> {
  try {
    const { data: chaptersRaw, error: chapErr } = await supabaseAdmin
      .from("chapters")
      .select(`
        id,
        title,
        chapter_number,
        topics (
          id,
          title,
          topic_number
        )
      `)
      .eq("curriculum_node_id", nodeId)
      .order("chapter_number", { ascending: true });

    if (chapErr) throw chapErr;

    return {
      success: true,
      chapters: (chaptersRaw || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        chapter_number: c.chapter_number,
        topics: (c.topics || []).sort(
          (a: any, b: any) => a.topic_number - b.topic_number
        ),
      })),
    };
  } catch (err: any) {
    console.error("Get Node Chapters/Topics Error:", err);
    return { success: false, chapters: [], error: err.message };
  }
}

/**
 * Creates a chapter and topic on the fly for a curriculum node.
 */
export async function createChapterAndTopicAction(
  nodeId: string,
  chapterTitle: string,
  topicTitle: string
): Promise<{
  success: boolean;
  topicId?: string;
  chapterId?: string;
  error?: string;
}> {
  const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    // 1. Fetch node info to get subject_id and class_level
    const { data: nodeData, error: nodeErr } = await supabaseAdmin
      .from("curriculum_nodes")
      .select("subject_id, class_level")
      .eq("id", nodeId)
      .single();

    if (nodeErr || !nodeData) throw new Error("Curriculum node not found.");

    // 2. Get highest chapter number
    const { data: existingChapters } = await supabaseAdmin
      .from("chapters")
      .select("chapter_number")
      .eq("curriculum_node_id", nodeId)
      .order("chapter_number", { ascending: false })
      .limit(1);

    const nextChapNum = (existingChapters?.[0]?.chapter_number || 0) + 1;

    // 3. Insert Chapter
    const { data: newChapter, error: chapErr } = await supabaseAdmin
      .from("chapters")
      .insert({
        curriculum_node_id: nodeId,
        subject_id: nodeData.subject_id,
        class_level: nodeData.class_level,
        title: chapterTitle.trim(),
        chapter_number: nextChapNum,
      })
      .select("id")
      .single();

    if (chapErr || !newChapter)
      throw chapErr || new Error("Failed to create chapter");

    // 4. Insert Topic
    const { data: newTopic, error: topicErr } = await supabaseAdmin
      .from("topics")
      .insert({
        chapter_id: newChapter.id,
        title: topicTitle.trim(),
        topic_number: `${nextChapNum}.1`,
      })
      .select("id")
      .single();

    if (topicErr || !newTopic)
      throw topicErr || new Error("Failed to create topic");

    return {
      success: true,
      chapterId: newChapter.id,
      topicId: newTopic.id,
    };
  } catch (err: any) {
    console.error("Create Chapter/Topic Error:", err);
    return {
      success: false,
      error: err.message || "Failed to create chapter and topic.",
    };
  }
}
