import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {item.href ? (
            <Link href={item.href} className="hover:underline" style={{ color: "var(--color-text-muted)" }}>
              {item.label}
            </Link>
          ) : (
            <span style={{ color: "var(--color-foreground)" }}>{item.label}</span>
          )}
          {i < items.length - 1 && <ChevronRight size={14} style={{ color: "var(--color-text-muted)" }} />}
        </span>
      ))}
    </nav>
  );
}
