import { request } from "@/lib/apiClient";
import { ApiEnvelope, Category, PaginatedResponse } from "@/types";

export interface ListCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
}

export async function listCategories(params: ListCategoriesParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Category>>>("categories", {
    method: "get",
    params,
  });
}

export async function getCategory(id: string) {
  return request<ApiEnvelope<Category>>(`categories/${id}`, {
    method: "get",
  });
}

export async function createCategory(data: CategoryInput) {
  return request<ApiEnvelope<Category>>("categories", {
    method: "post",
    data,
  });
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  return request<ApiEnvelope<Category>>(`categories/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteCategory(id: string) {
  return request<ApiEnvelope<Category>>(`categories/${id}`, {
    method: "delete",
  });
}
