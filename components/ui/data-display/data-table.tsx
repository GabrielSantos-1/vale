import * as React from "react";
import { cn } from "@/lib/cn";
import { Card, CardContent } from "@/components/ui/core/card";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => React.ReactNode;
};

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowKey: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  tableClassName?: string;
  rowClassName?: (row: T, index: number) => string | undefined;
}

const SKELETON_ROWS = 5;

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  isLoading = false,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Ajuste os filtros ou tente novamente mais tarde.",
  className,
  tableClassName,
  rowClassName,
}: DataTableProps<T>) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-[24px] border border-white/10 bg-surface shadow-none",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table
          className={cn(
            "min-w-full border-collapse text-left",
            tableClassName
          )}
        >
          <thead className="bg-white/5">
            <tr className="border-b border-border/80">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted",
                    column.className,
                    column.headerClassName
                  )}
                  scope="col"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
                <tr
                  key={`skeleton-${rowIndex}`}
                  className="border-b border-border/80 last:border-b-0"
                >
                  {columns.map((column) => (
                    <td
                      key={`${column.key}-${rowIndex}`}
                      className={cn("px-4 py-4 align-middle", column.cellClassName)}
                    >
                      <div className="h-4 w-full max-w-[180px] animate-pulse rounded-md bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  <CardContent className="px-6 py-16 text-center">
                    <div className="mx-auto max-w-md space-y-2">
                      <h3 className="text-base font-semibold text-primary">
                        {emptyTitle}
                      </h3>
                      <p className="text-sm leading-6 text-secondary">
                        {emptyDescription}
                      </p>
                    </div>
                  </CardContent>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className={cn(
                    "border-b border-border/80 transition-colors hover:bg-white/5 last:border-b-0",
                    rowClassName?.(row, index)
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-4 align-middle text-sm text-primary",
                        column.cellClassName
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}