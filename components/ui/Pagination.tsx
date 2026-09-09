"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import IconButton from "./IconButton";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <div className="flex items-center gap-1">
      <IconButton
        aria-label="Previous page"
        icon={<ChevronLeft size={16} />}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <React.Fragment key={p}>
            {showEllipsis && <span className="px-1 text-sm" style={{ color: "var(--color-text-muted)" }}>…</span>}
            <button
              onClick={() => onPageChange(p)}
              className="h-8 w-8 rounded-md text-sm font-medium transition-colors duration-150"
              style={{
                background: p === page ? "var(--color-primary)" : "transparent",
                color: p === page ? "var(--color-surface)" : "var(--color-foreground)",
              }}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          </React.Fragment>
        );
      })}
      <IconButton
        aria-label="Next page"
        icon={<ChevronRight size={16} />}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </div>
  );
}
