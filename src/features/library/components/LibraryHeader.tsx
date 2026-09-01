"use client";

import Link from "next/link";
import {
  BookOpen,
  Search,
  Sparkles,
  Zap,
  Building2,
  FileText,
  Layers,
  X,
} from "lucide-react";

interface LibraryHeaderProps {
  totalBooks: number;
  totalPages: number;
  totalAssignments: number;
  search: string;
  onSearchChange: (val: string) => void;
}

export function LibraryHeader({
  totalBooks,
  totalPages,
  totalAssignments,
  search,
  onSearchChange,
}: LibraryHeaderProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* ── 1. Main Banner ────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Digital Library</span>
            <span className="text-cyan-400">Vault</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Enterprise textbook repository hosted on Backblaze B2 storage with multi-syllabus curriculum mapping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/ai-creation"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-display uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>Open AI Question Studio</span>
          </Link>
        </div>
      </div>

      {/* ── 2. Top Stats Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Repository Books
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-white mt-0.5 tracking-tight">
              {totalBooks}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] text-cyan-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Indexed PDF Pages
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 tracking-tight">
              {totalPages.toLocaleString()}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] to-transparent border border-white/[0.08] backdrop-blur-md flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Syllabus Mappings
            </p>
            <p className="font-display text-2xl sm:text-3xl font-black text-purple-400 mt-0.5 tracking-tight">
              {totalAssignments}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── 3. Search Bar ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md p-2.5 flex items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search textbook title, board name, or subject..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
