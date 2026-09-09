"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import { SelectOption } from "./Select";

export interface MultiSelectProps {
  label?: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({ label, options, value, onChange, placeholder = "Select...", className }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = (v: string) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} ref={ref}>
      {label && <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex flex-wrap items-center gap-1.5 rounded-md text-sm px-3 py-2 min-h-[38px] text-left"
          style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
        >
          {value.length === 0 && <span style={{ color: "var(--color-text-muted)" }}>{placeholder}</span>}
          {value.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <span
                key={v}
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
                style={{ background: "var(--color-primary)", color: "var(--color-surface)" }}
              >
                {opt?.label ?? v}
                <X
                  size={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(v);
                  }}
                />
              </span>
            );
          })}
          <ChevronDown size={16} className="ml-auto shrink-0" style={{ color: "var(--color-text-muted)" }} />
        </button>
        {open && (
          <div
            className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-md shadow-lg"
            style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            {options.map((o) => (
              <label
                key={o.value}
                className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
              >
                <input type="checkbox" checked={value.includes(o.value)} onChange={() => toggle(o.value)} />
                {o.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
