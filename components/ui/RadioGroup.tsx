"use client";

import React from "react";

export interface RadioOption {
  value: string;
  label: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  direction?: "row" | "column";
}

export default function RadioGroup({ name, options, value, onChange, label, direction = "column" }: RadioGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      {label && <legend className="text-sm font-medium mb-1" style={{ color: "var(--color-foreground)" }}>{label}</legend>}
      <div className={direction === "row" ? "flex flex-row gap-4 flex-wrap" : "flex flex-col gap-2"}>
        {options.map((o) => (
          <label key={o.value} className="inline-flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--color-foreground)" }}>
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              style={{ accentColor: "var(--color-primary)" }}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
