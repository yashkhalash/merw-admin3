import { request } from "@/lib/apiClient";
import { ApiEnvelope, Commission, PaginatedResponse } from "@/types";

export interface ListCommissionsParams {
  page?: number;
  limit?: number;
  sellerId?: string;
  categoryId?: string;
}

export interface CommissionInput {
  rate: number;
  sellerId?: string | null;
  categoryId?: string | null;
}

export async function listCommissions(params: ListCommissionsParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Commission>>>("commissions", {
    method: "get",
    params,
  });
}

export async function getCommission(id: string) {
  return request<ApiEnvelope<Commission>>(`commissions/${id}`, {
    method: "get",
  });
}

export async function createCommission(data: CommissionInput) {
  return request<ApiEnvelope<Commission>>("commissions", {
    method: "post",
    data,
  });
}

export async function updateCommission(id: string, data: Partial<CommissionInput>) {
  return request<ApiEnvelope<Commission>>(`commissions/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteCommission(id: string) {
  return request<ApiEnvelope<{ id: string }>>(`commissions/${id}`, {
    method: "delete",
  });
}
