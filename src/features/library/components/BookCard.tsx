import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Edit2,
  Trash2,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  Loader2,
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { LibraryBook } from "../types/libraryTypes";
import { deleteBookAction, updateBookThumbnailAction } from "../actions/libraryActions";
import { BookCoverThumbnail } from "./BookCoverThumbnail";

interface BookCardProps {
  book: LibraryBook;
  onEditAssignments: (book: LibraryBook) => void;
  onDeleted: () => void;
  onUpdated?: () => void;
}

export function BookCard({
  book,
  onEditAssignments,
  onDeleted,
  onUpdated,
}: BookCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Cover thumbnail upload states
  const [showCoverDialog, setShowCoverDialog] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [coverSuccess, setCoverSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "—";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteBookAction(book.id);
      setShowDeleteDialog(false);
      onDeleted();
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setCoverError("Please select an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setCoverError("Image file size must be less than 10MB.");
      return;
    }

    setIsUploadingCover(true);
    setCoverError(null);
    setCoverSuccess(false);

    try {
      // 1. Upload to B2
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/library/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.fileUrl) {
        throw new Error(data.error || "Failed to upload image cover.");
      }

      // 2. Update database record
      const updateRes = await updateBookThumbnailAction(book.id, data.fileUrl);
      if (!updateRes.success) {
        throw new Error(updateRes.error || "Failed to update cover thumbnail.");
      }

      setCoverSuccess(true);
      if (onUpdated) onUpdated();
      setTimeout(() => {
        setShowCoverDialog(false);
        setCoverSuccess(false);
      }, 1000);
    } catch (err: any) {
      console.error("Cover upload error:", err);
      setCoverError(err.message || "Failed to upload cover.");
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    <>
      <div className="group rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md hover:border-white/20 transition-all duration-200 p-5 space-y-4 shadow-sm flex flex-col justify-between font-sans relative overflow-hidden">
        {/* ── Top Header Strip & Cover Preview ───────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Book Cover Thumbnail with Quick Upload Overlay */}
            <div
              onClick={() => setShowCoverDialog(true)}
              className="relative rounded-xl overflow-hidden cursor-pointer group/cover shadow-sm shrink-0"
              title="Click to view or change book cover"
            >
              <BookCoverThumbnail
                thumbnailUrl={book.thumbnail_url}
                title={book.title}
                subjectName={book.assignments?.[0]?.subject?.name}
                size="md"
              />

              {/* Hover overlay icon */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/cover:opacity-100 flex items-center justify-center text-white transition-opacity rounded-xl">
                <Camera className="w-3.5 h-3.5 text-cyan-300" />
              </div>
            </div>

            <div className="min-w-0 space-y-0.5">
              <h3
                className="text-sm font-bold font-display text-white transition-colors line-clamp-1 group-hover:text-cyan-300"
                title={book.title}
              >
                {book.title}
              </h3>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans flex-wrap">
                <span>{book.page_count ? `${book.page_count} Pages` : "PDF Document"}</span>
                <span className="text-white/20">•</span>
                <span>{formatFileSize(book.file_size_bytes)}</span>
                <span className="text-white/20">•</span>
                <span>
                  {new Date(book.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Icon Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowCoverDialog(true)}
              className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-cyan-300 border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Upload Cover Thumbnail"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onEditAssignments(book)}
              className="h-8 w-8 rounded-lg bg-white/[0.04] hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Edit Syllabus Assignments"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 w-8 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center transition-colors cursor-pointer"
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
                  className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-slate-300 font-sans flex items-center gap-1.5 truncate max-w-[220px]"
                >
                  <strong className="text-cyan-300 font-display font-bold">
                    {a.subject?.name || "Subject"}
                  </strong>
                  <span className="text-white/20">|</span>
                  <span className="text-slate-400">{a.board?.code || "Board"}</span>
                  <span className="text-white/20">|</span>
                  <span className="font-mono text-pgc-red font-bold">Cl {a.class_level || 11}</span>
                </span>
              ))}
              {book.assignments.length > 3 && (
                <span className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] font-mono text-slate-400">
                  +{book.assignments.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              Not mapped to any syllabus yet.
            </p>
          )}
        </div>

        {/* ── Bottom: Launch AI Studio CTA ──────────────────────────── */}
        <div className="pt-2 border-t border-white/[0.06]">
          <Link
            href={aiStudioUrl}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-slate-200 hover:text-white text-xs font-bold font-display uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Launch in AI Studio</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ── Cover Image Upload Dialog ───────────────────────────────── */}
      <Dialog open={showCoverDialog} onOpenChange={(open) => !open && setShowCoverDialog(false)}>
        <DialogContent className="w-[95vw] max-w-md bg-[#0B0C16] border border-white/15 text-white backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-4 font-sans">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold font-display text-white tracking-tight">
                  Textbook Cover Thumbnail
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Upload a cover image or preview the current thumbnail for this book.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {coverError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{coverError}</span>
            </div>
          )}

          {coverSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Cover thumbnail updated successfully!</span>
            </div>
          )}

          {/* Current Cover Preview */}
          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <BookCoverThumbnail
              thumbnailUrl={book.thumbnail_url}
              title={book.title}
              subjectName={book.assignments?.[0]?.subject?.name}
              size="lg"
            />

            <p className="text-xs font-semibold text-white text-center truncate max-w-xs font-display">
              {book.title}
            </p>
          </div>

          {/* File Upload Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCoverFileSelect}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            className="hidden"
          />

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowCoverDialog(false)}
              disabled={isUploadingCover}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingCover}
              className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isUploadingCover ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading Cover...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image Cover</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Professional Glassmorphic Delete Confirmation Dialog ───── */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => !open && setShowDeleteDialog(false)}>
        <DialogContent className="w-[95vw] max-w-md bg-[#0B0C16] border border-white/15 text-white backdrop-blur-2xl rounded-2xl p-6 shadow-2xl space-y-4 font-sans">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center text-pgc-red shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold font-display text-white tracking-tight">
                  Delete Textbook
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Are you sure you want to permanently delete this textbook?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Textbook Detail Summary Box */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
            <p className="text-xs font-bold font-display text-white truncate">
              {book.title}
            </p>
            <p className="text-[11px] text-slate-400">
              {book.page_count ? `${book.page_count} Pages` : "PDF Document"} • {formatFileSize(book.file_size_bytes)} • {book.assignments.length} syllabus {book.assignments.length === 1 ? "mapping" : "mappings"}
            </p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            This will remove the file and all linked syllabus curriculum associations. This action cannot be undone.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-pgc-red hover:bg-[#c92a37] text-white text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 border border-red-600/30 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Textbook</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
