"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Sparkles, Plus, Loader2 } from "lucide-react";
import type { LibraryBook } from "../types/libraryTypes";
import { getLibraryBooksAction } from "../actions/libraryActions";
import { LibraryHeader } from "./LibraryHeader";
import { BookUploadDropzone } from "./BookUploadDropzone";
import { BookCard } from "./BookCard";
import { AssignCurriculumDrawer } from "./AssignCurriculumDrawer";

export function LibraryGrid() {
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Partial<LibraryBook> | null>(null);
  const [isNewUpload, setIsNewUpload] = useState(false);

  const loadBooks = async () => {
    setIsLoading(true);
    try {
      const res = await getLibraryBooksAction();
      if (res.success) {
        setBooks(res.books);
      }
    } catch (err) {
      console.error("Failed to load library books:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleUploadSuccess = (newBook: Partial<LibraryBook>) => {
    setEditingBook(newBook);
    setIsNewUpload(true);
    setIsDrawerOpen(true);
  };

  const handleEditAssignments = (book: LibraryBook) => {
    setEditingBook(book);
    setIsNewUpload(false);
    setIsDrawerOpen(true);
  };

  const filteredBooks = useMemo(() => {
    if (!search.trim()) return books;
    const q = search.toLowerCase();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.assignments.some(
          (a) =>
            a.subject?.name.toLowerCase().includes(q) ||
            a.board?.name.toLowerCase().includes(q) ||
            a.board?.code.toLowerCase().includes(q) ||
            a.discipline?.name.toLowerCase().includes(q)
        )
    );
  }, [books, search]);

  const totalPages = useMemo(() => {
    return books.reduce((sum, b) => sum + (b.page_count || 0), 0);
  }, [books]);

  const totalAssignments = useMemo(() => {
    return books.reduce((sum, b) => sum + b.assignments.length, 0);
  }, [books]);

  return (
    <div className="space-y-8 pb-20 font-sans animate-in fade-in duration-300">
      {/* ── 1. Top Header & Stats Strip ───────────────────────────── */}
      <LibraryHeader
        totalBooks={books.length}
        totalPages={totalPages}
        totalAssignments={totalAssignments}
        search={search}
        onSearchChange={setSearch}
      />

      {/* ── 2. Direct S3/B2 Upload Zone ───────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-bold font-display uppercase tracking-wider text-white">
            Upload Textbook to Backblaze B2 Repository
          </h2>
        </div>
        <BookUploadDropzone onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* ── 3. Books Grid Canvas ──────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold font-display uppercase tracking-wider text-white">
              Repository Textbooks ({filteredBooks.length})
            </h2>
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredBooks.length} of {books.length} items
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-56 rounded-3xl bg-white/[0.02] border border-white/[0.08]"
              />
            ))}
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEditAssignments={handleEditAssignments}
                onDeleted={loadBooks}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold font-display text-white">
              No textbooks found in repository
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Drag and drop a PDF file above to upload to Backblaze B2 and assign to the curriculum.
            </p>
          </div>
        )}
      </div>

      {/* ── 4. Assignment Drawer Modal ────────────────────────────── */}
      <AssignCurriculumDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        book={editingBook}
        isNewUpload={isNewUpload}
        onSuccess={loadBooks}
      />
    </div>
  );
}
