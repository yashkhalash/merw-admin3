import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL, buildApiUrl } from "./apiConfig";

const TOKEN_KEY = "merw_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  config.headers = config.headers ?? {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypasses ngrok's free-tier HTML "you're about to visit..." interstitial, which
  // otherwise intercepts requests before they reach the tunneled backend — harmless
  // no-op against any non-ngrok host, so it's safe to always send.
  config.headers["ngrok-skip-browser-warning"] = "true";
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/** Call a versioned, role-scoped resource, e.g. request("auth/login", { method: "post", data }) */
export async function request<T = unknown>(
  resourcePath: string,
  config: Parameters<AxiosInstance["request"]>[0] = {}
): Promise<T> {
  const url = buildApiUrl(resourcePath);
  const res = await apiClient.request<T>({ url, ...config });
  return res.data;
}

export default apiClient;
