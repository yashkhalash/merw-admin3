"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useLoaderPreference } from "@/providers/LoaderPreferenceProvider";

export interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: string;
}

function RawSkeleton({ className, width, height, rounded = "rounded-md" }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer", rounded, className)}
      style={{ width, height, background: "var(--color-border)" }}
    />
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-5 w-5 rounded-full border-2 border-t-transparent animate-spin", className)}
      style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
    />
  );
}

function ProgressBar({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-1.5 w-full overflow-hidden rounded-full", className)} style={{ background: "var(--color-border)" }}>
      <div className="absolute top-0 h-full rounded-full animate-progress" style={{ background: "var(--color-primary)" }} />
    </div>
  );
}

function Dots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full animate-pulse"
          style={{ background: "var(--color-primary)", animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton renders according to the user's chosen loader preference
 * (Settings > Loader), falling back to a classic shimmer skeleton block.
 */
export default function Skeleton(props: SkeletonProps) {
  let loaderStyle = "skeleton";
  try {
    // useLoaderPreference must run inside its provider; this component is always
    // rendered within AppProviders, so this is safe.
    loaderStyle = useLoaderPreference().loaderStyle;
  } catch {
    // provider not mounted (e.g. isolated storybook usage) — fall back silently
  }

  switch (loaderStyle) {
    case "spinner":
      return <Spinner className={props.className} />;
    case "progressbar":
      return <ProgressBar className={props.className} />;
    case "dots":
      return <Dots className={props.className} />;
    case "pulse":
      return <RawSkeleton {...props} className={cn("animate-pulse", props.className)} />;
    case "bar-skeleton":
      return (
        <div className="flex flex-col gap-2 w-full">
          <ProgressBar />
          <RawSkeleton {...props} />
        </div>
      );
    default:
      return <RawSkeleton {...props} />;
  }
}

export { RawSkeleton, Spinner, ProgressBar, Dots };
