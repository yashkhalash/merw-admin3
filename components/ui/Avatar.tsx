import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export default function Avatar({ name, src, size = 36, className }: AvatarProps) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className={cn("rounded-full flex items-center justify-center font-semibold shrink-0", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: "var(--color-primary)",
        color: "var(--color-surface)",
      }}
      aria-label={name}
    >
      {initials(name) || "?"}
    </div>
  );
}
