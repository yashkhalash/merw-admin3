"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  hint,
  leftIcon,
  type = "text",
  className,
  id,
  ...props
}: InputProps) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 flex items-center pointer-events-none" style={{ color: "var(--color-text-muted)" }}>
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={isPassword ? (show ? "text" : "password") : type}
          className={cn(
            "w-full rounded-md text-sm px-3 py-2 outline-none transition-colors duration-150 focus:ring-2",
            Boolean(leftIcon) && "pl-9",
            isPassword && "pr-10",
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
        {isPassword && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 flex items-center"
            style={{ color: "var(--color-text-muted)" }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-xs text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
