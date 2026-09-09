"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const areaId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={areaId} className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
          {label}
        </label>
      )}
      <textarea
        id={areaId}
        rows={4}
        className={cn(
          "w-full rounded-md text-sm px-3 py-2 outline-none transition-colors duration-150 focus:ring-2 resize-y",
          className
        )}
        style={{
          background: "var(--color-surface)",
          color: "var(--color-foreground)",
          border: `1px solid ${error ? "#dc2626" : "var(--color-border)"}`,
        }}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
