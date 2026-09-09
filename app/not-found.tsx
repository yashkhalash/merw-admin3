"use client";

import Link from "next/link";
import { FileQuestion } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4" style={{ background: "var(--color-background)" }}>
      <div className="flex items-center justify-center h-16 w-16 rounded-full" style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}>
        <FileQuestion size={28} style={{ color: "var(--color-primary)" }} />
      </div>
      <h1 className="text-2xl font-semibold" style={{ color: "var(--color-foreground)" }}>404 — Page not found</h1>
      <p className="text-sm max-w-sm" style={{ color: "var(--color-text-muted)" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/dashboard">
        <Button size="sm">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
