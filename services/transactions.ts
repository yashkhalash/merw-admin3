import { request } from "@/lib/apiClient";
import { ApiEnvelope, PaginatedResponse, Transaction, TransactionStatus } from "@/types";

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  status?: TransactionStatus;
  orderId?: string;
}

export interface TransactionInput {
  orderId: string;
  amount: number;
  status?: TransactionStatus;
  reference?: string | null;
}

export async function listTransactions(params: ListTransactionsParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Transaction>>>("transactions", {
    method: "get",
    params,
  });
}

export async function getTransaction(id: string) {
  return request<ApiEnvelope<Transaction>>(`transactions/${id}`, {
    method: "get",
  });
}

export async function createTransaction(data: TransactionInput) {
  return request<ApiEnvelope<Transaction>>("transactions", {
    method: "post",
    data,
  });
}

export async function updateTransaction(id: string, data: Partial<TransactionInput>) {
  return request<ApiEnvelope<Transaction>>(`transactions/${id}`, {
    method: "put",
    data,
  });
}

export async function updateTransactionStatus(id: string, status: TransactionStatus) {
  return request<ApiEnvelope<Transaction>>(`transactions/${id}/status`, {
    method: "patch",
    data: { status },
  });
}

export async function deleteTransaction(id: string) {
  return request<ApiEnvelope<{ id: string }>>(`transactions/${id}`, {
    method: "delete",
  });
}
