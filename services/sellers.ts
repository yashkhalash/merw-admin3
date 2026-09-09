import { request } from "@/lib/apiClient";
import { ApiEnvelope, PaginatedResponse, Seller, SellerApprovalStatus } from "@/types";

export interface ListSellersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: SellerApprovalStatus | "";
}

export interface SellerInput {
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
}

export async function listSellers(params: ListSellersParams = {}) {
  const { page = 1, limit = 10, search, status } = params;
  return request<ApiEnvelope<PaginatedResponse<Seller>>>("sellers", {
    method: "get",
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });
}

export async function getSeller(id: string) {
  return request<ApiEnvelope<Seller>>(`sellers/${id}`, { method: "get" });
}

export async function createSeller(data: SellerInput) {
  return request<ApiEnvelope<Seller>>("sellers", { method: "post", data });
}

export async function updateSeller(id: string, data: Partial<SellerInput>) {
  return request<ApiEnvelope<Seller>>(`sellers/${id}`, { method: "put", data });
}

export async function deleteSeller(id: string) {
  return request<ApiEnvelope<{ id: string }>>(`sellers/${id}`, { method: "delete" });
}

export async function updateSellerApproval(id: string, approvalStatus: SellerApprovalStatus) {
  return request<ApiEnvelope<Seller>>(`sellers/${id}/approval`, {
    method: "patch",
    data: { approvalStatus },
  });
}
