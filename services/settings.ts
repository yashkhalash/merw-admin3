import { request } from "@/lib/apiClient";
import { ApiEnvelope } from "@/types";

export interface ApiVersionConfig {
  id?: string;
  version: string;
  updatedAt?: string;
}

export async function getApiVersionConfig() {
  return request<ApiEnvelope<ApiVersionConfig>>("settings/api-version", { method: "get" });
}

export async function updateApiVersionConfig(version: string) {
  return request<ApiEnvelope<ApiVersionConfig>>("settings/api-version", {
    method: "put",
    data: { version },
  });
}

export interface GeneralSettings {
  id?: string;
  siteName: string;
  supportEmail: string;
  logoUrl: string | null;
  updatedAt?: string;
}

export type GeneralSettingsUpdate = Partial<Pick<GeneralSettings, "siteName" | "supportEmail" | "logoUrl">>;

/** Public — no auth required, so the login screen can render the site name/logo. */
export async function getGeneralSettings() {
  return request<ApiEnvelope<GeneralSettings>>("settings/general", { method: "get" });
}

export async function updateGeneralSettings(patch: GeneralSettingsUpdate) {
  return request<ApiEnvelope<GeneralSettings>>("settings/general", {
    method: "put",
    data: patch,
  });
}
