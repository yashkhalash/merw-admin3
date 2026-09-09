import { request } from "@/lib/apiClient";
import { ApiEnvelope, Customer, PaginatedResponse } from "@/types";

export interface ListCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone?: string;
}

export async function listCustomers(params: ListCustomersParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Customer>>>("customers", {
    method: "get",
    params,
  });
}

export async function getCustomer(id: string) {
  return request<ApiEnvelope<Customer>>(`customers/${id}`, {
    method: "get",
  });
}

export async function createCustomer(data: CustomerInput) {
  return request<ApiEnvelope<Customer>>("customers", {
    method: "post",
    data,
  });
}

export async function updateCustomer(id: string, data: Partial<CustomerInput>) {
  return request<ApiEnvelope<Customer>>(`customers/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteCustomer(id: string) {
  return request<ApiEnvelope<{ id: string }>>(`customers/${id}`, {
    method: "delete",
  });
}
