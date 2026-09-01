"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/supabase/rbac";
import {
  saveBookRecordSchema,
  updateBookAssignmentsSchema,
} from "../schemas/librarySchemas";
import type {
  LibraryBook,
  SaveBookRecordInput,
  BookAssignmentPayload,
  CurriculumNodeDetails,
} from "../types/libraryTypes";
import type {
  Board,
  Discipline,
  Subject,
} from "@/features/curriculum/types/curriculumTypes";

/**
 * Fetches all books from the Digital Library along with their syllabus assignments.
 */
export async function getLibraryBooksAction(params?: {
  subjectId?: string | null;
  boardId?: string | null;
  search?: string | null;
}): Promise<{
  success: boolean;
  books: LibraryBook[];
  error?: string;
}> {
  const auth = await requireAuth(["SUPER_ADMIN", "CAMPUS_MANAGER", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, books: [], error: auth.error };
  }

  try {
    let query = supabaseAdmin
      .from("library_books")
      .select(`
        id,
        title,
        file_url,
        file_key,
        file_size_bytes,
        page_count,
        thumbnail_url,
        created_at,
        assignments:book_assignments (
          id,
          book_id,
          curriculum_node_id,
          board_id,
          discipline_id,
          subject_id,
          class_level,
          created_at,
          board:boards (id, name, code, logo_url),
          discipline:disciplines (id, name, code),
          subject:subjects (id, name, code, script_type, textbook_cover_url)
        )
      `)
      .order("created_at", { ascending: false });

    if (params?.search && params.search.trim()) {
      query = query.ilike("title", `%${params.search.trim()}%`);
    }

    const { data: booksRaw, error: fetchErr } = await query;
    if (fetchErr) throw fetchErr;

    let books: LibraryBook[] = (booksRaw || []).map((b: any) => ({
      id: b.id,
      title: b.title,
      file_url: b.file_url,
      file_key: b.file_key,
      file_size_bytes: b.file_size_bytes,
      page_count: b.page_count,
      thumbnail_url: b.thumbnail_url,
      created_at: b.created_at,
      assignments: (b.assignments || []).map((a: any) => ({
        id: a.id,
        book_id: a.book_id,
        curriculum_node_id: a.curriculum_node_id,
        board_id: a.board_id,
        discipline_id: a.discipline_id,
        subject_id: a.subject_id,
        class_level: a.class_level,
        created_at: a.created_at,
        board: a.board,
        discipline: a.discipline,
        subject: a.subject,
      })),
    }));

    // Filter by subject or board if passed
    if (params?.subjectId) {
      books = books.filter((b) =>
        b.assignments.some((a) => a.subject_id === params.subjectId)
      );
    }
    if (params?.boardId) {
      books = books.filter((b) =>
        b.assignments.some((a) => a.board_id === params.boardId)
      );
    }

    return { success: true, books };
  } catch (err: any) {
    console.error("Failed to query library books:", err);
    return { success: false, books: [], error: err.message || "Failed to load digital library." };
  }
}

/**
 * Saves a newly uploaded textbook record to library_books and inserts its curriculum assignments.
 */
export async function saveBookRecordAction(
  rawInput: SaveBookRecordInput
): Promise<{
  success: boolean;
  book?: LibraryBook;
  error?: string;
}> {
  const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = saveBookRecordSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues?.[0]?.message || "Invalid book record parameters.",
    };
  }

  const { title, file_url, file_key, file_size_bytes, page_count, thumbnail_url, assignments } =
    parsed.data;

  try {
    // 1. Insert into library_books
    const { data: bookData, error: bookErr } = await supabaseAdmin
      .from("library_books")
      .insert({
        title,
        file_url,
        file_key,
        file_size_bytes: file_size_bytes || null,
        page_count: page_count || null,
        thumbnail_url: thumbnail_url || null,
      })
      .select()
      .single();

    if (bookErr) throw bookErr;

    // 2. Insert assignments if any
    if (assignments && assignments.length > 0) {
      const assignmentRows = assignments.map((a) => ({
        book_id: bookData.id,
        curriculum_node_id: a.curriculum_node_id || null,
        board_id: a.board_id || null,
        discipline_id: a.discipline_id || null,
        subject_id: a.subject_id || null,
        class_level: a.class_level || null,
      }));

      const { error: assignErr } = await supabaseAdmin
        .from("book_assignments")
        .insert(assignmentRows);

      if (assignErr) throw assignErr;
    }

    revalidatePath("/admin/library");
    revalidatePath("/admin/ai-creation");

    return {
      success: true,
      book: {
        ...bookData,
        assignments: [],
      } as LibraryBook,
    };
  } catch (err: any) {
    console.error("Save Book Error:", err);
    return { success: false, error: err.message || "Failed to save book record." };
  }
}

/**
 * Updates the multi-syllabus assignments for an existing book.
 */
export async function updateBookAssignmentsAction(rawInput: {
  book_id: string;
  assignments: BookAssignmentPayload[];
}): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  const parsed = updateBookAssignmentsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid assignments." };
  }

  const { book_id, assignments } = parsed.data;

  try {
    // Delete existing assignments for this book
    const { error: deleteErr } = await supabaseAdmin
      .from("book_assignments")
      .delete()
      .eq("book_id", book_id);

    if (deleteErr) throw deleteErr;

    // Re-insert new assignments
    if (assignments.length > 0) {
      const assignmentRows = assignments.map((a) => ({
        book_id,
        curriculum_node_id: a.curriculum_node_id || null,
        board_id: a.board_id || null,
        discipline_id: a.discipline_id || null,
        subject_id: a.subject_id || null,
        class_level: a.class_level || null,
      }));

      const { error: insertErr } = await supabaseAdmin
        .from("book_assignments")
        .insert(assignmentRows);

      if (insertErr) throw insertErr;
    }

    revalidatePath("/admin/library");
    revalidatePath("/admin/ai-creation");
    return { success: true };
  } catch (err: any) {
    console.error("Update Assignments Error:", err);
    return { success: false, error: err.message || "Failed to update assignments." };
  }
}

/**
 * Deletes a textbook and its assignments from the database.
 */
export async function deleteBookAction(
  bookId: string
): Promise<{ success: boolean; error?: string }> {
  const auth = await requireAuth(["SUPER_ADMIN", "TEACHER"]);
  if (!auth.authorized) {
    return { success: false, error: auth.error };
  }

  try {
    const { error } = await supabaseAdmin
      .from("library_books")
      .delete()
      .eq("id", bookId);

    if (error) throw error;

    revalidatePath("/admin/library");
    revalidatePath("/admin/ai-creation");
    return { success: true };
  } catch (err: any) {
    console.error("Delete Book Error:", err);
    return { success: false, error: err.message || "Failed to delete book." };
  }
}

/**
 * Fetches all active Curriculum Nodes with joined Boards, Disciplines, and Subjects
 * to drive strictly validated cascading selections.
 */
export async function getCurriculumMetadataAction(): Promise<{
  success: boolean;
  nodes: CurriculumNodeDetails[];
  error?: string;
}> {
  try {
    const { data: nodesRaw, error: nodesErr } = await supabaseAdmin
      .from("curriculum_nodes")
      .select(`
        id,
        class_level,
        board_id,
        discipline_id,
        subject_id,
        board:boards (id, name, code, is_active),
        discipline:disciplines (id, name, code, is_active),
        subject:subjects (id, name, code, is_active)
      `);

    if (nodesErr) throw nodesErr;

    const nodes: CurriculumNodeDetails[] = (nodesRaw || [])
      .filter(
        (n: any) =>
          n.board &&
          n.board.is_active !== false &&
          n.discipline &&
          n.discipline.is_active !== false &&
          n.subject &&
          n.subject.is_active !== false
      )
      .map((n: any) => ({
        id: n.id,
        class_level: n.class_level || 11,
        board_id: n.board_id,
        board_name: n.board.name,
        board_code: n.board.code,
        discipline_id: n.discipline_id,
        discipline_name: n.discipline.name,
        discipline_code: n.discipline.code,
        subject_id: n.subject_id,
        subject_name: n.subject.name,
        subject_code: n.subject.code,
      }));

    return {
      success: true,
      nodes,
    };
  } catch (err: any) {
    console.error("Failed to load curriculum metadata:", err);
    return { success: false, nodes: [], error: err.message || "Failed to load curriculum nodes." };
  }
}
