"use client";

import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import type { SortingState } from "../store/useCampusStore";

interface SortableTableHeadProps {
  label: string;
  columnKey: string;
  currentSorting?: SortingState | null;
  onSort?: (columnKey: string) => void;
  align?: "left" | "center" | "right";
  className?: string;
}

export function SortableTableHead({
  label,
  columnKey,
  currentSorting,
  onSort,
  align = "left",
  className = "",
}: SortableTableHeadProps) {
  const isSorted = currentSorting?.column === columnKey;
  const direction = isSorted ? currentSorting?.direction : null;

  return (
    <TableHead
      className={`text-white/50 font-semibold uppercase tracking-wider text-[11px] h-11 select-none ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      } ${className}`}
    >
      {onSort ? (
        <button
          onClick={() => onSort(columnKey)}
          className={`inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group ${
            isSorted ? "text-white font-bold" : "text-white/50"
          }`}
        >
          <span>{label}</span>
          {direction === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5 text-pgc-red" />
          ) : direction === "desc" ? (
            <ArrowDown className="w-3.5 h-3.5 text-pgc-red" />
          ) : (
            <ArrowUpDown className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
          )}
        </button>
      ) : (
        <span>{label}</span>
      )}
    </TableHead>
  );
}
