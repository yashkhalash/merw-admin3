import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function Card({ children, className, style, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-xl p-5 transition-shadow duration-200", className)}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
