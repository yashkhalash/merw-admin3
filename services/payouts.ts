import { request } from "@/lib/apiClient";
import { ApiEnvelope, PaginatedResponse, Payout, PayoutStatus } from "@/types";

export interface ListPayoutsParams {
  page?: number;
  limit?: number;
  status?: PayoutStatus;
  sellerId?: string;
}

export interface PayoutInput {
  sellerId: string;
  amount: number;
  status?: PayoutStatus;
}

export async function listPayouts(params: ListPayoutsParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Payout>>>("payouts", {
    method: "get",
    params,
  });
}

export async function getPayout(id: string) {
  return request<ApiEnvelope<Payout>>(`payouts/${id}`, {
    method: "get",
  });
}

export async function createPayout(data: PayoutInput) {
  return request<ApiEnvelope<Payout>>("payouts", {
    method: "post",
    data,
  });
}

export async function updatePayout(id: string, data: Partial<PayoutInput>) {
  return request<ApiEnvelope<Payout>>(`payouts/${id}`, {
    method: "put",
    data,
  });
}

export async function updatePayoutStatus(id: string, status: PayoutStatus) {
  return request<ApiEnvelope<Payout>>(`payouts/${id}/status`, {
    method: "patch",
    data: { status },
  });
}

export async function deletePayout(id: string) {
  return request<ApiEnvelope<{ id: string }>>(`payouts/${id}`, {
    method: "delete",
  });
}
