"use client";

import React from "react";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";
import { TableError } from "./ErrorState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
}

export default function DataTable<T>({ columns, data, loading, error, onRetry, rowKey, emptyMessage = "No records found" }: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg" style={{ border: "1px solid var(--color-border)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: "var(--color-background)" }}>
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left font-medium px-4 py-3 whitespace-nowrap"
                style={{ color: "var(--color-text-muted)" }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} style={{ borderTop: "1px solid var(--color-border)" }}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton height={16} />
                  </td>
                ))}
              </tr>
            ))}
          {!loading && error && (
            <tr>
              <td colSpan={columns.length}>
                <TableError onRetry={onRetry} />
              </td>
            </tr>
          )}
          {!loading && !error && data.length === 0 && (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          )}
          {!loading &&
            !error &&
            data.map((row) => (
              <tr
                key={rowKey(row)}
                style={{ borderTop: "1px solid var(--color-border)" }}
                className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors duration-150"
              >
                {columns.map((col) => (
                  <td key={col.key} className={`px-4 py-3 whitespace-nowrap ${col.className ?? ""}`} style={{ color: "var(--color-foreground)" }}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
