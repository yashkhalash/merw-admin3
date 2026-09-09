import { request } from "@/lib/apiClient";
import { ApiEnvelope, AuthUser } from "@/types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function login(email: string, password: string) {
  return request<ApiEnvelope<LoginResponse>>("auth/login", {
    method: "post",
    data: { email, password },
  });
}

export async function forgotPassword(email: string) {
  return request<ApiEnvelope<{ message?: string }>>("auth/forgot-password", {
    method: "post",
    data: { email },
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return request<ApiEnvelope<{ message?: string }>>("auth/reset-password", {
    method: "post",
    data: { token, newPassword },
  });
}

export async function getMe() {
  return request<ApiEnvelope<AuthUser>>("auth/me", { method: "get" });
}
