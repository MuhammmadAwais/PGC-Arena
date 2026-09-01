"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Sparkles,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  ChevronRight,
  Zap,
} from "lucide-react";
import type { LibraryBook } from "../types/libraryTypes";
import { deleteBookAction } from "../actions/libraryActions";

interface BookCardProps {
  book: LibraryBook;
  onEditAssignments: (book: LibraryBook) => void;
  onDeleted: () => void;
}

export function BookCard({ book, onEditAssignments, onDeleted }: BookCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const handleDelete = async () => {
    if (confirm(`Permanently delete "${book.title}" from the Digital Library?`)) {
      setIsDeleting(true);
      try {
        await deleteBookAction(book.id);
        onDeleted();
      } catch (err) {
        console.error("Delete failed:", err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Build AI Studio Link params using first assignment context if available
  const firstAssignment = book.assignments[0];
  const aiStudioUrl = `/admin/ai-creation?bookId=${book.id}&bookUrl=${encodeURIComponent(
    book.file_url
  )}${firstAssignment?.subject_id ? `&subjectId=${firstAssignment.subject_id}` : ""}${
    firstAssignment?.class_level ? `&classLevel=${firstAssignment.class_level}` : ""
  }`;

  return (
    <div className="group rounded-3xl bg-[#0e111d] hover:bg-[#131728] border border-white/[0.08] hover:border-cyan-400/40 p-5 space-y-4 shadow-xl hover:shadow-cyan-500/5 transition-all duration-300 flex flex-col justify-between font-sans">
      {/* ── Top Header Strip ──────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-12 h-14 rounded-2xl bg-black/60 border border-white/15 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>

          <div className="min-w-0 space-y-1">
            <h3
              className="text-sm font-bold font-display text-white group-hover:text-cyan-300 transition-colors line-clamp-2"
              title={book.title}
            >
              {book.title}
            </h3>

            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap">
              <span>{book.page_count ? `${book.page_count} Pages` : "PDF Document"}</span>
              <span>•</span>
              <span>{formatFileSize(book.file_size_bytes)}</span>
              <span>•</span>
              <span className="text-slate-500">
                {new Date(book.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Icon Menu */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEditAssignments(book)}
            className="h-8 w-8 rounded-xl bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
            title="Edit Syllabus Assignments"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-8 w-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            title="Delete Book"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── Middle: Syllabus Mappings ──────────────────────────────── */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[10px] font-display uppercase tracking-wider font-bold text-slate-400 block">
          Assigned Curriculum ({book.assignments.length}):
        </span>

        {book.assignments.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap max-h-20 overflow-hidden">
            {book.assignments.slice(0, 3).map((a) => (
              <span
                key={a.id}
                className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] text-slate-300 font-sans flex items-center gap-1 truncate max-w-[200px]"
              >
                <strong className="text-cyan-300 font-display font-bold">
                  {a.subject?.name || "Subject"}
                </strong>
                <span className="text-slate-500">|</span>
                <span>{a.board?.code || "Board"}</span>
                <span className="text-slate-500">|</span>
                <span className="font-mono">Cl {a.class_level || 11}</span>
              </span>
            ))}
            {book.assignments.length > 3 && (
              <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-400">
                +{book.assignments.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Not mapped to any syllabus yet.
          </p>
        )}
      </div>

      {/* ── Bottom: Launch AI Studio CTA ──────────────────────────── */}
      <div className="pt-2 border-t border-white/[0.06] flex items-center gap-2">
        <Link
          href={aiStudioUrl}
          className="flex-1 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:scale-[1.01]"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400/40 text-amber-400" />
          <span>Launch in AI Studio</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        <a
          href={book.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
          title="Open Original PDF"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
