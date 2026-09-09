"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { palettes, Palette } from "@/styles/palettes";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
  setMode: (m: Mode) => void;
  paletteId: string;
  palette: Palette;
  setPaletteId: (id: string) => void;
  palettes: Palette[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PALETTE_KEY = "merw_palette_id";
const MODE_KEY = "merw_theme_mode";

function applyPalette(palette: Palette, mode: Mode) {
  const tokens = mode === "dark" ? palette.dark : palette.light;
  const root = document.documentElement;
  root.style.setProperty("--color-primary", tokens.accent1);
  root.style.setProperty("--color-secondary", tokens.accent2);
  root.style.setProperty("--color-accent2", tokens.accent2);
  root.style.setProperty("--color-surface", tokens.surface);
  root.style.setProperty("--color-background", tokens.bg);
  root.style.setProperty("--color-foreground", tokens.text);
  // Derive border + muted-text from the active palette's own tokens instead of
  // leaving them pinned to globals.css's static dark values — otherwise a
  // custom palette's surface color clashes with an unrelated gray border.
  root.style.setProperty(
    "--color-border",
    `color-mix(in srgb, ${tokens.text} 14%, ${tokens.surface})`
  );
  root.style.setProperty(
    "--color-text-muted",
    `color-mix(in srgb, ${tokens.text} 58%, ${tokens.bg})`
  );
  root.setAttribute("data-theme", mode);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  const [paletteId, setPaletteIdState] = useState<string>("default");

  useEffect(() => {
    try {
      const storedMode = localStorage.getItem(MODE_KEY) as Mode | null;
      const storedPalette = localStorage.getItem(PALETTE_KEY);
      const initialMode =
        storedMode ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const initialPalette = storedPalette || "default";
      setModeState(initialMode);
      setPaletteIdState(initialPalette);
      const palette = palettes.find((p) => p.id === initialPalette) || palettes[0];
      applyPalette(palette, initialMode);
    } catch {
      applyPalette(palettes[0], "light");
    }
  }, []);

  const palette = useMemo(
    () => palettes.find((p) => p.id === paletteId) || palettes[0],
    [paletteId]
  );

  const setMode = useCallback(
    (m: Mode) => {
      setModeState(m);
      try {
        localStorage.setItem(MODE_KEY, m);
      } catch {}
      applyPalette(palette, m);
    },
    [palette]
  );

  const toggleMode = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const setPaletteId = useCallback(
    (id: string) => {
      setPaletteIdState(id);
      try {
        localStorage.setItem(PALETTE_KEY, id);
      } catch {}
      const p = palettes.find((pp) => pp.id === id) || palettes[0];
      applyPalette(p, mode);
    },
    [mode]
  );

  const value: ThemeContextValue = {
    mode,
    toggleMode,
    setMode,
    paletteId,
    palette,
    setPaletteId,
    palettes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
