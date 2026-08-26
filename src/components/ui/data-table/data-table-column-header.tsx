"use client";

import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps {
  label: string;
  columnKey: string;
  currentSorting?: { column: string; direction: "asc" | "desc" } | null;
  onSort?: (columnKey: string) => void;
  className?: string;
  align?: "left" | "right" | "center";
}

export function DataTableColumnHeader({
  label,
  columnKey,
  currentSorting,
  onSort,
  className,
  align = "left",
}: DataTableColumnHeaderProps) {
  const isSorted = currentSorting?.column === columnKey;
  const direction = isSorted ? currentSorting.direction : null;

  if (!onSort || columnKey === "actions") {
    return (
      <TableHead
        className={cn(
          "text-xs font-semibold text-slate-400 uppercase tracking-wider py-3",
          align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
          className
        )}
      >
        {label}
      </TableHead>
    );
  }

  return (
    <TableHead
      className={cn(
        "py-3 text-xs font-semibold uppercase tracking-wider select-none",
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onSort(columnKey)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded px-1.5 py-1 hover:bg-white/[0.06] transition-colors cursor-pointer text-xs font-semibold uppercase tracking-wider",
          isSorted ? "text-white" : "text-slate-400 hover:text-slate-200"
        )}
      >
        <span>{label}</span>
        {direction === "asc" ? (
          <ArrowUp className="w-3.5 h-3.5 text-pgc-red" />
        ) : direction === "desc" ? (
          <ArrowDown className="w-3.5 h-3.5 text-pgc-red" />
        ) : (
          <ChevronsUpDown className="w-3.5 h-3.5 opacity-40 hover:opacity-100" />
        )}
      </button>
    </TableHead>
  );
}
