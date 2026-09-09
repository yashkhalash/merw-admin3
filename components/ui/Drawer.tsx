"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";
import { cn } from "@/lib/utils";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  widthClassName?: string;
}

export default function Drawer({ open, onClose, title, children, side = "right", widthClassName = "max-w-md" }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")}>
      <div
        className="absolute inset-0 bg-black/40 transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0 }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute top-0 bottom-0 w-full flex flex-col shadow-2xl transition-transform duration-200",
          widthClassName,
          side === "right" ? "right-0" : "left-0"
        )}
        style={{
          background: "var(--color-surface)",
          color: "var(--color-foreground)",
          transform: open ? "translateX(0)" : side === "right" ? "translateX(100%)" : "translateX(-100%)",
        }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-base font-semibold">{title}</h2>
          <IconButton aria-label="Close panel" icon={<X size={18} />} onClick={onClose} />
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
