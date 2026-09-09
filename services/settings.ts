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
