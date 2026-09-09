import { request } from "@/lib/apiClient";
import { ApiEnvelope, PaginatedResponse, Product, ProductModerationStatus } from "@/types";

export interface ListProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  moderationStatus?: ProductModerationStatus | "";
  categoryId?: string;
  sellerId?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sellerId: string;
  categoryId: string;
}

export async function listProducts(params: ListProductsParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Product>>>("products", {
    method: "get",
    params,
  });
}

export async function getProduct(id: string) {
  return request<ApiEnvelope<Product>>(`products/${id}`, {
    method: "get",
  });
}

export async function createProduct(data: ProductInput) {
  return request<ApiEnvelope<Product>>("products", {
    method: "post",
    data,
  });
}

export async function updateProduct(id: string, data: Partial<ProductInput>) {
  return request<ApiEnvelope<Product>>(`products/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteProduct(id: string) {
  return request<ApiEnvelope<Product>>(`products/${id}`, {
    method: "delete",
  });
}

export async function updateProductModeration(id: string, moderationStatus: ProductModerationStatus) {
  return request<ApiEnvelope<Product>>(`products/${id}/moderation`, {
    method: "patch",
    data: { moderationStatus },
  });
}
