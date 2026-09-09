"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
  lg: "text-base px-5 py-2.5 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const variantStyle: React.CSSProperties = {};
  let variantClass = "";

  switch (variant) {
    case "primary":
      variantStyle.background = "var(--color-primary)";
      variantStyle.color = "var(--color-surface)";
      variantClass = "hover:opacity-90";
      break;
    case "secondary":
      variantStyle.background = "var(--color-secondary)";
      variantStyle.color = "var(--color-surface)";
      variantClass = "hover:opacity-90";
      break;
    case "outline":
      variantStyle.background = "transparent";
      variantStyle.color = "var(--color-foreground)";
      variantStyle.border = "1px solid var(--color-border)";
      variantClass = "hover:bg-black/5 dark:hover:bg-white/5";
      break;
    case "ghost":
      variantStyle.background = "transparent";
      variantStyle.color = "var(--color-foreground)";
      variantClass = "hover:bg-black/5 dark:hover:bg-white/5";
      break;
    case "danger":
      variantStyle.background = "#dc2626";
      variantStyle.color = "#ffffff";
      variantClass = "hover:opacity-90";
      break;
  }

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        sizeClasses[size],
        variantClass,
        className
      )}
      style={{ ...variantStyle, ...style, outlineColor: "var(--color-primary)" }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
