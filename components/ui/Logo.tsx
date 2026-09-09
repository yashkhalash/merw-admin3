"use client";

import { useSiteConfig } from "@/providers/SiteConfigProvider";

export default function Logo({ collapsed = false, size = 28 }: { collapsed?: boolean; size?: number }) {
  const { siteName, logoUrl } = useSiteConfig();

  return (
    <div className="flex items-center gap-2 select-none min-w-0">
      {logoUrl ? (
        // Fixed square tile with object-contain (not cover) — an uploaded logo can be
        // any aspect ratio, and cropping/stretching it to fill a square looks distorted.
        <div
          className="flex items-center justify-center rounded-[10px] shrink-0 overflow-hidden"
          style={{ width: size, height: size, background: "var(--color-background)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- logoUrl is a data: URI, not a static asset */}
          <img src={logoUrl} alt={siteName} className="max-h-full max-w-full object-contain" />
        </div>
      ) : (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className="shrink-0">
          <rect width="40" height="40" rx="10" fill="var(--color-primary)" />
          <path
            d="M8 28V12l6 10 6-10 6 10 6-10v16"
            stroke="var(--color-surface)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      )}
      {!collapsed && (
        <span
          className="font-bold text-lg tracking-tight truncate"
          style={{ color: "var(--color-foreground)" }}
        >
          {siteName}
        </span>
      )}
    </div>
  );
}
