"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  "aria-label": string;
  variant?: "ghost" | "solid";
  size?: 16 | 20 | 24;
}

export default function IconButton({
  icon,
  variant = "ghost",
  size = 20,
  className,
  style,
  ...props
}: IconButtonProps) {
  const pad = size === 16 ? "p-1.5" : size === 20 ? "p-2" : "p-2.5";
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50",
        pad,
        variant === "ghost" ? "hover:bg-black/5 dark:hover:bg-white/10" : "",
        className
      )}
      style={{
        color: "var(--color-foreground)",
        background: variant === "solid" ? "var(--color-primary)" : undefined,
        outlineColor: "var(--color-primary)",
        ...style,
      }}
      {...props}
    >
      {icon}
    </button>
  );
}
