"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultKey?: string;
}

export default function Tabs({ tabs, defaultKey }: TabsProps) {
  const [active, setActive] = useState(defaultKey || tabs[0]?.key);

  return (
    <div>
      <div role="tablist" className="flex items-center gap-1 border-b overflow-x-auto no-scrollbar" style={{ borderColor: "var(--color-border)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            onClick={() => setActive(tab.key)}
            className="relative px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150"
            style={{ color: active === tab.key ? "var(--color-primary)" : "var(--color-text-muted)" }}
          >
            {tab.label}
            {active === tab.key && (
              <span
                className="absolute left-0 right-0 -bottom-px h-0.5 rounded-full transition-all duration-200"
                style={{ background: "var(--color-primary)" }}
              />
            )}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {tabs.map((tab) => (
          <div key={tab.key} className={cn(active === tab.key ? "block animate-fade-in" : "hidden")}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
