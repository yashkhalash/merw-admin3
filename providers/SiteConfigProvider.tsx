"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getGeneralSettings,
  updateGeneralSettings,
  GeneralSettings,
  GeneralSettingsUpdate,
} from "@/services/settings";

const DEFAULTS: GeneralSettings = {
  siteName: "MERW Marketplace",
  supportEmail: "support@merw.com",
  logoUrl: null,
};

interface SiteConfigContextValue {
  siteName: string;
  supportEmail: string;
  logoUrl: string | null;
  loading: boolean;
  /** Saves the patch to the API and updates local state on success; throws on failure. */
  updateSiteConfig: (patch: GeneralSettingsUpdate) => Promise<void>;
  refresh: () => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<GeneralSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await getGeneralSettings();
      setConfig({ ...DEFAULTS, ...res.data });
    } catch {
      // Keep defaults — e.g. backend unreachable during local/mock development.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Reflect the site name in the browser tab across every route, including auth
  // screens rendered before the dashboard layout mounts.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = config.siteName;
    }
  }, [config.siteName]);

  const updateSiteConfig = useCallback(async (patch: GeneralSettingsUpdate) => {
    const res = await updateGeneralSettings(patch);
    setConfig({ ...DEFAULTS, ...res.data });
  }, []);

  const value: SiteConfigContextValue = {
    siteName: config.siteName,
    supportEmail: config.supportEmail,
    logoUrl: config.logoUrl,
    loading,
    updateSiteConfig,
    refresh,
  };

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) throw new Error("useSiteConfig must be used within SiteConfigProvider");
  return ctx;
}
