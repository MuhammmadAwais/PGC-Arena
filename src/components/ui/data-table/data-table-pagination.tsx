"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTablePaginationProps {
  totalItems: number;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function DataTablePagination({
  totalItems,
  pageIndex,
  pageSize,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const pageCount = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : pageIndex * pageSize + 1;
  const endItem = Math.min(totalItems, (pageIndex + 1) * pageSize);

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-3.5 border-t border-white/[0.06] text-xs font-sans bg-white/[0.01]">
      {/* Items range display */}
      <div className="text-slate-400">
        Showing <strong className="text-white font-semibold">{startItem}</strong> to{" "}
        <strong className="text-white font-semibold">{endItem}</strong> of{" "}
        <strong className="text-white font-semibold">{totalItems}</strong> entries
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Custom Glass Rows Per Page Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 whitespace-nowrap">Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 px-2.5 rounded-lg bg-black/40 hover:bg-white/[0.08] border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer outline-none transition-all">
              <span>{pageSize}</span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[80px] p-1">
              {pageSizeOptions.map((size) => (
                <DropdownMenuItem
                  key={size}
                  onClick={() => onPageSizeChange(size)}
                  className="justify-between text-xs py-1.5"
                >
                  <span>{size}</span>
                  {pageSize === size && <Check className="w-3.5 h-3.5 text-pgc-red" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Page X of Y */}
        <div className="text-slate-300 font-medium whitespace-nowrap">
          Page {pageIndex + 1} of {pageCount}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            onClick={() => onPageChange(0)}
            disabled={!canPreviousPage}
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            onClick={() => onPageChange(pageIndex - 1)}
            disabled={!canPreviousPage}
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            onClick={() => onPageChange(pageIndex + 1)}
            disabled={!canNextPage}
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08] disabled:opacity-20 disabled:pointer-events-none cursor-pointer"
            onClick={() => onPageChange(pageCount - 1)}
            disabled={!canNextPage}
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
