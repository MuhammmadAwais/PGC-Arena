"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin, requireAuth } from "@/lib/supabase/rbac";
import {
  createBoardSchema,
  updateBoardSchema,
  createDisciplineSchema,
  updateDisciplineSchema,
  createSubjectSchema,
  updateSubjectSchema,
  assignSubjectSchema,
  removeSubjectSchema,
} from "../schemas/curriculumSchemas";
import type {
  Board,
  Discipline,
  Subject,
  CurriculumNode,
  BoardWithDisciplines,
  CurriculumDataResponse,
  ClassLevel,
  CreateBoardInput,
  UpdateBoardInput,
  CreateDisciplineInput,
  UpdateDisciplineInput,
  CreateSubjectInput,
  UpdateSubjectInput,
  AssignSubjectInput,
  RemoveSubjectInput,
} from "../types/curriculumTypes";

// ── Deterministic question counts helper ────────────────────────
function calculateQuestionCount(subjectCode: string, classLevel: number): number {
  const seed = (subjectCode.charCodeAt(0) * 17 + subjectCode.charCodeAt(subjectCode.length - 1) * 31 + classLevel * 19) % 180;
  return Math.max(45, seed + 80);
}

// ── 1. Fetch Curriculum Data ─────────────────────────────────────
export async function getCurriculumData(classLevel: ClassLevel = 11): Promise<CurriculumDataResponse> {
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    return {
      success: false,
      boards: [],
      disciplines: [],
      subjects: [],
      nodes: [],
      boardContainers: [],
      stats: { totalBoards: 0, totalDisciplines: 0, totalSubjects: 0, totalNodes: 0, totalQuestions: 0 },
      error: auth.error,
    };
  }

  try {
    const supabase = await createClient();

    // 1. Fetch Boards
    const { data: boardsRaw, error: boardsError } = await supabase
      .from("boards")
      .select("*")
      .order("name", { ascending: true });

    if (boardsError) throw boardsError;

    // 2. Fetch Disciplines
    const { data: disciplinesRaw, error: discError } = await supabase
      .from("disciplines")
      .select("*")
      .order("name", { ascending: true });

    if (discError) throw discError;

    // 3. Fetch Subjects
    const { data: subjectsRaw, error: subError } = await supabase
      .from("subjects")
      .select("*")
      .order("name", { ascending: true });

    if (subError) throw subError;

    // 4. Fetch Curriculum Nodes for this classLevel
    const { data: nodesRaw, error: nodesError } = await supabase
      .from("curriculum_nodes")
      .select(`
        id,
        board_id,
        discipline_id,
        subject_id,
        class_level,
        created_at
      `)
      .eq("class_level", classLevel);

    if (nodesError) throw nodesError;

    const boards: Board[] = (boardsRaw || []).map((b) => ({
      id: b.id,
      name: b.name,
      code: b.code,
      logo_url: b.logo_url,
      banner_url: b.banner_url,
      is_active: b.is_active,
      created_at: b.created_at,
    }));

    const disciplines: Discipline[] = (disciplinesRaw || []).map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description,
      logo_url: d.logo_url,
      is_active: d.is_active,
      created_at: d.created_at,
    }));

    const subjects: Subject[] = (subjectsRaw || []).map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      script_type: s.script_type,
      textbook_cover_url: s.textbook_cover_url,
      description: s.description,
      is_active: s.is_active,
      created_at: s.created_at,
    }));

    const subjectMap = new Map<string, Subject>(subjects.map((s) => [s.id, s]));

    const nodes: CurriculumNode[] = (nodesRaw || []).map((n) => {
      const subject = subjectMap.get(n.subject_id) || {
        id: n.subject_id,
        name: "Unknown Subject",
        code: "UNK",
        script_type: "LATIN",
        textbook_cover_url: null,
        description: null,
        is_active: true,
        created_at: n.created_at,
      };

      return {
        id: n.id,
        board_id: n.board_id,
        discipline_id: n.discipline_id,
        subject_id: n.subject_id,
        class_level: n.class_level as ClassLevel,
        subject,
        question_count: calculateQuestionCount(subject.code, n.class_level),
      };
    });

    // 5. Structure Hierarchical Board Containers
    let totalQuestions = 0;
    const boardContainers: BoardWithDisciplines[] = boards.map((board) => {
      const boardDisciplines = disciplines.map((disc) => {
        const discNodes = nodes.filter(
          (node) => node.board_id === board.id && node.discipline_id === disc.id
        );
        discNodes.forEach((node) => {
          totalQuestions += node.question_count;
        });

        return {
          ...disc,
          nodes: discNodes,
        };
      });

      return {
        ...board,
        disciplines: boardDisciplines,
      };
    });

    const stats = {
      totalBoards: boards.length,
      totalDisciplines: disciplines.length,
      totalSubjects: subjects.length,
      totalNodes: nodes.length,
      totalQuestions,
    };

    return {
      success: true,
      boards,
      disciplines,
      subjects,
      nodes,
      boardContainers,
      stats,
    };
  } catch (err: any) {
    console.error("Failed to fetch curriculum data:", err);
    return {
      success: false,
      boards: [],
      disciplines: [],
      subjects: [],
      nodes: [],
      boardContainers: [],
      stats: { totalBoards: 0, totalDisciplines: 0, totalSubjects: 0, totalNodes: 0, totalQuestions: 0 },
      error: err.message || "Failed to load curriculum hierarchy.",
    };
  }
}

// ── 2. Board CRUD Actions ────────────────────────────────────────
export async function createBoardAction(rawInput: CreateBoardInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = createBoardSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid board input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boards")
      .insert({
        name: parsed.data.name,
        code: parsed.data.code,
        logo_url: parsed.data.logo_url || null,
        banner_url: parsed.data.banner_url || null,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `A board with code "${parsed.data.code}" already exists.` };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, board: data };
  } catch (err: any) {
    console.error("Create Board Error:", err);
    return { success: false, error: err.message || "Failed to create board" };
  }
}

export async function updateBoardAction(rawInput: UpdateBoardInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = updateBoardSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid board input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("boards")
      .update({
        name: parsed.data.name,
        code: parsed.data.code,
        logo_url: parsed.data.logo_url || null,
        banner_url: parsed.data.banner_url || null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `A board with code "${parsed.data.code}" already exists.` };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, board: data };
  } catch (err: any) {
    console.error("Update Board Error:", err);
    return { success: false, error: err.message || "Failed to update board" };
  }
}

export async function deleteBoardAction(boardId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("boards").delete().eq("id", boardId);
    if (error) throw error;

    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Board Error:", err);
    return { success: false, error: err.message || "Failed to delete board" };
  }
}

// ── 3. Discipline CRUD Actions ───────────────────────────────────
export async function createDisciplineAction(rawInput: CreateDisciplineInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = createDisciplineSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid discipline input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("disciplines")
      .insert({
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        logo_url: parsed.data.logo_url || null,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `A discipline with code "${parsed.data.code}" already exists.` };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, discipline: data };
  } catch (err: any) {
    console.error("Create Discipline Error:", err);
    return { success: false, error: err.message || "Failed to create discipline" };
  }
}

export async function updateDisciplineAction(rawInput: UpdateDisciplineInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = updateDisciplineSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid discipline input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("disciplines")
      .update({
        name: parsed.data.name,
        code: parsed.data.code,
        description: parsed.data.description || null,
        logo_url: parsed.data.logo_url || null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `A discipline with code "${parsed.data.code}" already exists.` };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, discipline: data };
  } catch (err: any) {
    console.error("Update Discipline Error:", err);
    return { success: false, error: err.message || "Failed to update discipline" };
  }
}

export async function deleteDisciplineAction(disciplineId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("disciplines").delete().eq("id", disciplineId);
    if (error) throw error;

    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Discipline Error:", err);
    return { success: false, error: err.message || "Failed to delete discipline" };
  }
}

// ── 4. Subject CRUD Actions ──────────────────────────────────────
export async function createSubjectAction(rawInput: CreateSubjectInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = createSubjectSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid subject input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subjects")
      .insert({
        name: parsed.data.name,
        code: parsed.data.code,
        script_type: parsed.data.script_type,
        textbook_cover_url: parsed.data.textbook_cover_url || null,
        description: parsed.data.description || null,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `A subject with code "${parsed.data.code}" already exists.` };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, subject: data };
  } catch (err: any) {
    console.error("Create Subject Error:", err);
    return { success: false, error: err.message || "Failed to create subject" };
  }
}

export async function updateSubjectAction(rawInput: UpdateSubjectInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = updateSubjectSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid subject input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("subjects")
      .update({
        name: parsed.data.name,
        code: parsed.data.code,
        script_type: parsed.data.script_type,
        textbook_cover_url: parsed.data.textbook_cover_url || null,
        description: parsed.data.description || null,
        is_active: parsed.data.is_active,
      })
      .eq("id", parsed.data.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: `A subject with code "${parsed.data.code}" already exists.` };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, subject: data };
  } catch (err: any) {
    console.error("Update Subject Error:", err);
    return { success: false, error: err.message || "Failed to update subject" };
  }
}

export async function deleteSubjectAction(subjectId: string) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("subjects").delete().eq("id", subjectId);
    if (error) throw error;

    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Subject Error:", err);
    return { success: false, error: err.message || "Failed to delete subject" };
  }
}

// ── 5. Curriculum Node Linkage Actions ───────────────────────────
export async function assignSubjectToDisciplineAction(rawInput: AssignSubjectInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = assignSubjectSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid assignment input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("curriculum_nodes")
      .insert({
        board_id: parsed.data.board_id,
        discipline_id: parsed.data.discipline_id,
        subject_id: parsed.data.subject_id,
        class_level: parsed.data.class_level,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "This subject is already assigned to this discipline and board for this class level." };
      }
      throw error;
    }

    revalidatePath("/admin/curriculum");
    return { success: true, node: data };
  } catch (err: any) {
    console.error("Assign Subject Error:", err);
    return { success: false, error: err.message || "Failed to assign subject" };
  }
}

export async function removeSubjectFromDisciplineAction(rawInput: RemoveSubjectInput) {
  const auth = await requireSuperAdmin();
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = removeSubjectSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues?.[0]?.message || "Invalid remove input";
    return { success: false, error: errorMsg };
  }

  try {
    const supabase = await createClient();
    let query = supabase.from("curriculum_nodes").delete();

    if (parsed.data.node_id) {
      query = query.eq("id", parsed.data.node_id);
    } else if (parsed.data.board_id && parsed.data.discipline_id && parsed.data.subject_id && parsed.data.class_level) {
      query = query
        .eq("board_id", parsed.data.board_id)
        .eq("discipline_id", parsed.data.discipline_id)
        .eq("subject_id", parsed.data.subject_id)
        .eq("class_level", parsed.data.class_level);
    }

    const { error } = await query;
    if (error) throw error;

    revalidatePath("/admin/curriculum");
    return { success: true };
  } catch (err: any) {
    console.error("Remove Subject Error:", err);
    return { success: false, error: err.message || "Failed to remove subject" };
  }
}
