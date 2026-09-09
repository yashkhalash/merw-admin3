"use client";

import React from "react";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { LoaderPreferenceProvider } from "./LoaderPreferenceProvider";
import { SidebarPreferenceProvider } from "./SidebarPreferenceProvider";
import { ToastProvider } from "./ToastProvider";
import { AuthProvider } from "./AuthProvider";
import { SiteConfigProvider } from "./SiteConfigProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {/* Outermost so site name/logo are available on auth screens too, before login. */}
      <SiteConfigProvider>
        <ThemeProvider>
          <LoaderPreferenceProvider>
            <SidebarPreferenceProvider>
              <ToastProvider>
                <AuthProvider>{children}</AuthProvider>
              </ToastProvider>
            </SidebarPreferenceProvider>
          </LoaderPreferenceProvider>
        </ThemeProvider>
      </SiteConfigProvider>
    </QueryProvider>
  );
}
