import { request } from "@/lib/apiClient";
import { AdminUser, ApiEnvelope, PaginatedResponse, Role } from "@/types";

export interface ListRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RoleInput {
  name: string;
  permissions: Record<string, unknown>;
}

export async function listRoles(params: ListRolesParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Role>>>("roles", {
    method: "get",
    params,
  });
}

export async function getRole(id: string) {
  return request<ApiEnvelope<Role>>(`roles/${id}`, {
    method: "get",
  });
}

export async function createRole(data: RoleInput) {
  return request<ApiEnvelope<Role>>("roles", {
    method: "post",
    data,
  });
}

export async function updateRole(id: string, data: Partial<RoleInput>) {
  return request<ApiEnvelope<Role>>(`roles/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteRole(id: string) {
  return request<ApiEnvelope<Role>>(`roles/${id}`, {
    method: "delete",
  });
}

export interface ListAdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface AdminUserInput {
  name: string;
  email: string;
  password?: string;
  roleId?: string | null;
}

export async function listAdminUsers(params: ListAdminUsersParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<AdminUser>>>("roles/admin-users", {
    method: "get",
    params,
  });
}

export async function createAdminUser(data: AdminUserInput) {
  return request<ApiEnvelope<AdminUser>>("roles/admin-users", {
    method: "post",
    data,
  });
}

export async function updateAdminUser(id: string, data: Partial<AdminUserInput>) {
  return request<ApiEnvelope<AdminUser>>(`roles/admin-users/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteAdminUser(id: string) {
  return request<ApiEnvelope<AdminUser>>(`roles/admin-users/${id}`, {
    method: "delete",
  });
}
