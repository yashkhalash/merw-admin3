import { request } from "@/lib/apiClient";
import { ApiEnvelope, Faq, PaginatedResponse } from "@/types";

export interface ListFaqsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FaqInput {
  question: string;
  answer: string;
}

export async function listFaqs(params: ListFaqsParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Faq>>>("faqs", {
    method: "get",
    params,
  });
}

export async function getFaq(id: string) {
  return request<ApiEnvelope<Faq>>(`faqs/${id}`, {
    method: "get",
  });
}

export async function createFaq(data: FaqInput) {
  return request<ApiEnvelope<Faq>>("faqs", {
    method: "post",
    data,
  });
}

export async function updateFaq(id: string, data: Partial<FaqInput>) {
  return request<ApiEnvelope<Faq>>(`faqs/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteFaq(id: string) {
  return request<ApiEnvelope<Faq>>(`faqs/${id}`, {
    method: "delete",
  });
}
