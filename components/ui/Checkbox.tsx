"use client";

import React from "react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export default function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const checkId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <label htmlFor={checkId} className="inline-flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--color-foreground)" }}>
      <input
        id={checkId}
        type="checkbox"
        className={className}
        style={{ accentColor: "var(--color-primary)" }}
        {...props}
      />
      {label}
    </label>
  );
}
