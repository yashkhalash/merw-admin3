"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface DatePickerProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export default function DatePicker({ label, error, className, id, ...props }: DatePickerProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="date"
          className={cn("w-full rounded-md text-sm pl-3 pr-9 py-2 outline-none focus:ring-2", className)}
          style={{
            background: "var(--color-surface)",
            color: "var(--color-foreground)",
            border: `1px solid ${error ? "#dc2626" : "var(--color-border)"}`,
          }}
          {...props}
        />
        <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--color-text-muted)" }} />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
