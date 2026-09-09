"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { LoaderPreferenceProvider } from "./LoaderPreferenceProvider";
import { SidebarPreferenceProvider } from "./SidebarPreferenceProvider";
import { ToastProvider } from "./ToastProvider";
import { AuthProvider } from "./AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <LoaderPreferenceProvider>
          <SidebarPreferenceProvider>
            <ToastProvider>
              <AuthProvider>{children}</AuthProvider>
            </ToastProvider>
          </SidebarPreferenceProvider>
        </LoaderPreferenceProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
