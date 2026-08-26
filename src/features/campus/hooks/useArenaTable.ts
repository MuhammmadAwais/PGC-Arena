import { useState } from "react";
import {
  useTable,
  stockFeatures,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";

interface UseArenaTableProps<TData extends Record<string, any>> {
  data: TData[];
  columns: ColumnDef<any, TData>[];
}

export function useArenaTable<TData extends Record<string, any>>({
  data,
  columns,
}: UseArenaTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useTable<any, TData>({
    features: stockFeatures,
    data,
    columns: columns as any,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  });

  return { table, globalFilter, setGlobalFilter };
}
