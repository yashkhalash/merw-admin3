"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { LoaderStyle } from "@/types";

interface LoaderPreferenceContextValue {
  loaderStyle: LoaderStyle;
  setLoaderStyle: (s: LoaderStyle) => void;
}

const LoaderPreferenceContext = createContext<LoaderPreferenceContextValue | null>(null);
const KEY = "merw_loader_style";

export function LoaderPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [loaderStyle, setLoaderStyleState] = useState<LoaderStyle>("skeleton");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as LoaderStyle | null;
      if (stored) setLoaderStyleState(stored);
    } catch {}
  }, []);

  const setLoaderStyle = (s: LoaderStyle) => {
    setLoaderStyleState(s);
    try {
      localStorage.setItem(KEY, s);
    } catch {}
  };

  return (
    <LoaderPreferenceContext.Provider value={{ loaderStyle, setLoaderStyle }}>
      {children}
    </LoaderPreferenceContext.Provider>
  );
}

export function useLoaderPreference() {
  const ctx = useContext(LoaderPreferenceContext);
  if (!ctx) throw new Error("useLoaderPreference must be used within LoaderPreferenceProvider");
  return ctx;
}
