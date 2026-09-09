"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarPreferenceContextValue {
  defaultCollapsed: boolean;
  setDefaultCollapsed: (v: boolean) => void;
  compact: boolean;
  setCompact: (v: boolean) => void;
  hoverExpand: boolean;
  setHoverExpand: (v: boolean) => void;
}

const SidebarPreferenceContext = createContext<SidebarPreferenceContextValue | null>(null);
const COLLAPSED_KEY = "merw_sidebar_default_collapsed";
const COMPACT_KEY = "merw_sidebar_compact";
const HOVER_EXPAND_KEY = "merw_sidebar_hover_expand";

export function SidebarPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [defaultCollapsed, setDefaultCollapsedState] = useState(false);
  const [compact, setCompactState] = useState(false);
  const [hoverExpand, setHoverExpandState] = useState(false);

  useEffect(() => {
    try {
      setDefaultCollapsedState(localStorage.getItem(COLLAPSED_KEY) === "1");
      setCompactState(localStorage.getItem(COMPACT_KEY) === "1");
      setHoverExpandState(localStorage.getItem(HOVER_EXPAND_KEY) === "1");
    } catch {}
  }, []);

  const setDefaultCollapsed = (v: boolean) => {
    setDefaultCollapsedState(v);
    try {
      localStorage.setItem(COLLAPSED_KEY, v ? "1" : "0");
    } catch {}
  };

  const setCompact = (v: boolean) => {
    setCompactState(v);
    try {
      localStorage.setItem(COMPACT_KEY, v ? "1" : "0");
    } catch {}
  };

  const setHoverExpand = (v: boolean) => {
    setHoverExpandState(v);
    try {
      localStorage.setItem(HOVER_EXPAND_KEY, v ? "1" : "0");
    } catch {}
  };

  return (
    <SidebarPreferenceContext.Provider
      value={{
        defaultCollapsed,
        setDefaultCollapsed,
        compact,
        setCompact,
        hoverExpand,
        setHoverExpand,
      }}
    >
      {children}
    </SidebarPreferenceContext.Provider>
  );
}

export function useSidebarPreference() {
  const ctx = useContext(SidebarPreferenceContext);
  if (!ctx) throw new Error("useSidebarPreference must be used within SidebarPreferenceProvider");
  return ctx;
}
