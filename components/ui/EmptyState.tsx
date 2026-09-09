import React from "react";
import { Inbox } from "lucide-react";
import Button from "./Button";

export interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-12 px-4">
      <div
        className="flex items-center justify-center h-14 w-14 rounded-full"
        style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)" }}
      >
        <Icon size={24} style={{ color: "var(--color-primary)" }} />
      </div>
      <h3 className="text-base font-semibold" style={{ color: "var(--color-foreground)" }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-sm" style={{ color: "var(--color-text-muted)" }}>{description}</p>
      )}
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-1">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
