"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info" | "warning";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (t: Omit<ToastItem, "id">) => void;
  position: ToastPosition;
  setPosition: (p: ToastPosition) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const POSITION_KEY = "merw_toast_position";
const DEFAULT_POSITION: ToastPosition = "bottom-right";

const positionClasses: Record<ToastPosition, string> = {
  "top-left": "top-4 left-4 items-start",
  "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-4 right-4 items-end",
  "bottom-left": "bottom-4 left-4 items-start",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right": "bottom-4 right-4 items-end",
};

const variantIcon: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const variantColor: Record<ToastVariant, string> = {
  success: "#16a34a",
  error: "#dc2626",
  info: "#0ea5e9",
  warning: "#d97706",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const [position, setPositionState] = useState<ToastPosition>(DEFAULT_POSITION);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POSITION_KEY) as ToastPosition | null;
      if (stored && positionClasses[stored]) setPositionState(stored);
    } catch {}
  }, []);

  const setPosition = useCallback((p: ToastPosition) => {
    setPositionState(p);
    try {
      localStorage.setItem(POSITION_KEY, p);
    } catch {}
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), 5000);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ toast, position, setPosition }}>
      {children}
      <div
        className={cn(
          "fixed z-[100] flex flex-col gap-2 w-80 max-w-[90vw]",
          positionClasses[position]
        )}
      >
        {items.map((item) => {
          const Icon = variantIcon[item.variant];
          return (
            <div
              key={item.id}
              role="alert"
              className="animate-fade-in flex items-start gap-3 rounded-lg border p-3 shadow-lg w-full"
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <Icon size={20} style={{ color: variantColor[item.variant] }} className="mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description && (
                  <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                    {item.description}
                  </p>
                )}
              </div>
              <button
                aria-label="Dismiss notification"
                onClick={() => remove(item.id)}
                className="shrink-0 opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
