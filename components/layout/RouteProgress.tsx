"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Subtle top progress bar that flashes on route change. */
export default function RouteProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActive(true);
    timeoutRef.current = setTimeout(() => setActive(false), 400);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [pathname]);

  if (!active) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-0.5 z-[200] overflow-hidden" aria-hidden>
      <div
        className="absolute top-0 h-full animate-progress"
        style={{ background: "var(--color-primary)" }}
      />
    </div>
  );
}
