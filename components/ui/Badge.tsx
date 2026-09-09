import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "primary" | "success" | "warning" | "danger" | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

const colors: Record<BadgeVariant, string> = {
  primary: "var(--color-primary)",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#dc2626",
  neutral: "var(--color-text-muted)",
};

export default function Badge({ children, variant = "primary", dot = false, className }: BadgeProps) {
  const color = colors[variant];
  if (dot) {
    return <span className={cn("inline-block h-2 w-2 rounded-full", className)} style={{ background: color }} aria-label={typeof children === "string" ? children : undefined} />;
  }
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", className)}
      style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}
    >
      {children}
    </span>
  );
}
