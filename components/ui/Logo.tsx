export default function Logo({ collapsed = false, size = 28 }: { collapsed?: boolean; size?: number }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden>
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
      {!collapsed && (
        <span className="font-bold text-lg tracking-tight" style={{ color: "var(--color-foreground)" }}>
          MERW
        </span>
      )}
    </div>
  );
}
