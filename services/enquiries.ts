import { request } from "@/lib/apiClient";
import { ApiEnvelope, ContactEnquiry, PaginatedResponse } from "@/types";

export interface ListEnquiriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function listEnquiries(params: ListEnquiriesParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<ContactEnquiry>>>("enquiries", {
    method: "get",
    params,
  });
}

export async function getEnquiry(id: string) {
  return request<ApiEnvelope<ContactEnquiry>>(`enquiries/${id}`, {
    method: "get",
  });
}

export async function deleteEnquiry(id: string) {
  return request<ApiEnvelope<ContactEnquiry>>(`enquiries/${id}`, {
    method: "delete",
  });
}
