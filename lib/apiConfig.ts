// Central source of truth for the dynamic, versioned + role-scoped API base.
// URLs are always built as ${API_BASE_URL}/${version}/${role}/<resource>.
// Never hardcode "/api/v1/" anywhere else in the app.

export const API_BASE_URL =
  process.env.API_BASE_URL || "http://localhost:4000";

export const DEFAULT_API_VERSION = "v1";
export const DEFAULT_ROLE = "admin";

const VERSION_KEY = "merw_api_version";
const ROLE_KEY = "merw_api_role";

export function getApiVersion(): string {
  if (typeof window === "undefined") return DEFAULT_API_VERSION;
  return localStorage.getItem(VERSION_KEY) || DEFAULT_API_VERSION;
}

export function setApiVersion(version: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VERSION_KEY, version);
}

export function getApiRole(): string {
  if (typeof window === "undefined") return DEFAULT_ROLE;
  return localStorage.getItem(ROLE_KEY) || DEFAULT_ROLE;
}

export function setApiRole(role: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROLE_KEY, role);
}

export function buildApiUrl(resourcePath: string): string {
  const version = getApiVersion();
  const role = getApiRole();
  const cleanPath = resourcePath.replace(/^\/+/, "");
  return `${API_BASE_URL}/${version}/${role}/${cleanPath}`;
}
