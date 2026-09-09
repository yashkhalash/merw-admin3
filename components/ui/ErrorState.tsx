import React from "react";
import { AlertTriangle, WifiOff, ShieldAlert, ServerCrash } from "lucide-react";
import Button from "./Button";

export interface ErrorStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export default function ErrorState({ icon: Icon = AlertTriangle, title, description, onRetry, compact }: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-3 ${compact ? "py-6" : "py-12"} px-4`}>
      <div className="flex items-center justify-center h-14 w-14 rounded-full" style={{ background: "rgba(220,38,38,0.12)" }}>
        <Icon size={24} style={{ color: "#dc2626" }} />
      </div>
      <h3 className="text-base font-semibold" style={{ color: "var(--color-foreground)" }}>{title}</h3>
      {description && <p className="text-sm max-w-sm" style={{ color: "var(--color-text-muted)" }}>{description}</p>}
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} className="mt-1">
          Retry
        </Button>
      )}
    </div>
  );
}

export function PageError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon={AlertTriangle}
      title="Something went wrong"
      description="This page failed to load. Please try again."
      onRetry={onRetry}
    />
  );
}

export function TableError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon={ServerCrash}
      title="Could not load data"
      description="There was a problem fetching this table's data."
      onRetry={onRetry}
      compact
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      icon={WifiOff}
      title="No connection"
      description="Check your internet connection and try again."
      onRetry={onRetry}
    />
  );
}

export function PermissionDenied() {
  return (
    <ErrorState
      icon={ShieldAlert}
      title="Permission denied"
      description="You don't have access to view this content."
    />
  );
}
