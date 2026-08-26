"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArenaTablePaginationProps {
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export function ArenaTablePagination({
  totalItems,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20],
}: ArenaTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

  // Generate page numbers array (with max 5 visible pages)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, pageIndex - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-black/30 border-t border-white/[0.06] text-xs">
      {/* ── Summary & Page Size ─────────────────────────────────── */}
      <div className="flex items-center gap-3 text-white/50">
        <span>
          Showing <strong className="text-white/90">{startItem}</strong> to{" "}
          <strong className="text-white/90">{endItem}</strong> of{" "}
          <strong className="text-white">{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
            <span className="text-[11px] text-white/40">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-black/50 border border-white/10 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-pgc-red/60 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[#0B0C16] text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Page Controls & Arrows ──────────────────────────────── */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex <= 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs"
          title="Previous Page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Number Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p) => {
            const isActive = p === pageIndex;
            return (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`min-w-[28px] h-7 px-2 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                  isActive
                    ? "bg-pgc-red text-white font-bold shadow-[0_0_10px_rgba(227,59,41,0.3)]"
                    : "bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]"
                }`}
              >
                {p + 1}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages - 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs"
          title="Next Page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
