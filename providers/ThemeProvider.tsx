"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { palettes, Palette } from "@/styles/palettes";

type Mode = "light" | "dark";

interface ThemeContextValue {
  mode: Mode;
  toggleMode: () => void;
  setMode: (m: Mode) => void;

  // Light and dark themes each pick their own palette independently — switching
  // the light/dark toggle no longer forces the same palette's two color sets.
  lightPaletteId: string;
  darkPaletteId: string;
  lightPalette: Palette;
  darkPalette: Palette;
  setLightPaletteId: (id: string) => void;
  setDarkPaletteId: (id: string) => void;

  /** The palette backing whichever mode is currently active. */
  palette: Palette;
  /** The id of `palette` above — kept for callers that only care about "current" palette. */
  paletteId: string;

  palettes: Palette[];
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const LIGHT_PALETTE_KEY = "merw_light_palette_id";
const DARK_PALETTE_KEY = "merw_dark_palette_id";
const LEGACY_PALETTE_KEY = "merw_palette_id";
const MODE_KEY = "merw_theme_mode";

function resolvePalette(id: string | null | undefined, fallback: Palette): Palette {
  return (id && palettes.find((p) => p.id === id)) || fallback;
}

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
  const [lightPaletteId, setLightPaletteIdState] = useState<string>("default");
  const [darkPaletteId, setDarkPaletteIdState] = useState<string>("default");

  useEffect(() => {
    try {
      const storedMode = localStorage.getItem(MODE_KEY) as Mode | null;
      // Fall back to the old single-palette key so existing users keep their choice
      // as their starting point for both light and dark instead of resetting to default.
      const legacy = localStorage.getItem(LEGACY_PALETTE_KEY);
      const storedLight = localStorage.getItem(LIGHT_PALETTE_KEY) || legacy;
      const storedDark = localStorage.getItem(DARK_PALETTE_KEY) || legacy;
      const initialMode =
        storedMode ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const initialLight = resolvePalette(storedLight, palettes[0]);
      const initialDark = resolvePalette(storedDark, palettes[0]);
      setModeState(initialMode);
      setLightPaletteIdState(initialLight.id);
      setDarkPaletteIdState(initialDark.id);
      applyPalette(initialMode === "dark" ? initialDark : initialLight, initialMode);
    } catch {
      applyPalette(palettes[0], "light");
    }
  }, []);

  const lightPalette = useMemo(() => resolvePalette(lightPaletteId, palettes[0]), [lightPaletteId]);
  const darkPalette = useMemo(() => resolvePalette(darkPaletteId, palettes[0]), [darkPaletteId]);
  const activePalette = mode === "dark" ? darkPalette : lightPalette;

  const setMode = useCallback(
    (m: Mode) => {
      setModeState(m);
      try {
        localStorage.setItem(MODE_KEY, m);
      } catch {}
      applyPalette(m === "dark" ? darkPalette : lightPalette, m);
    },
    [lightPalette, darkPalette]
  );

  const toggleMode = useCallback(() => {
    setMode(mode === "light" ? "dark" : "light");
  }, [mode, setMode]);

  const setLightPaletteId = useCallback(
    (id: string) => {
      setLightPaletteIdState(id);
      try {
        localStorage.setItem(LIGHT_PALETTE_KEY, id);
      } catch {}
      if (mode === "light") {
        applyPalette(resolvePalette(id, palettes[0]), "light");
      }
    },
    [mode]
  );

  const setDarkPaletteId = useCallback(
    (id: string) => {
      setDarkPaletteIdState(id);
      try {
        localStorage.setItem(DARK_PALETTE_KEY, id);
      } catch {}
      if (mode === "dark") {
        applyPalette(resolvePalette(id, palettes[0]), "dark");
      }
    },
    [mode]
  );

  const value: ThemeContextValue = {
    mode,
    toggleMode,
    setMode,
    lightPaletteId,
    darkPaletteId,
    lightPalette,
    darkPalette,
    setLightPaletteId,
    setDarkPaletteId,
    palette: activePalette,
    paletteId: activePalette.id,
    palettes,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
