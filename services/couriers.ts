import { request } from "@/lib/apiClient";
import { ApiEnvelope, Courier, PaginatedResponse } from "@/types";

export interface ListCouriersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CourierInput {
  name: string;
  phone?: string;
  email?: string;
  serviceArea?: string;
}

export async function listCouriers(params: ListCouriersParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Courier>>>("couriers", {
    method: "get",
    params,
  });
}

export async function getCourier(id: string) {
  return request<ApiEnvelope<Courier>>(`couriers/${id}`, {
    method: "get",
  });
}

export async function createCourier(data: CourierInput) {
  return request<ApiEnvelope<Courier>>("couriers", {
    method: "post",
    data,
  });
}

export async function updateCourier(id: string, data: Partial<CourierInput>) {
  return request<ApiEnvelope<Courier>>(`couriers/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteCourier(id: string) {
  return request<ApiEnvelope<Courier>>(`couriers/${id}`, {
    method: "delete",
  });
}
