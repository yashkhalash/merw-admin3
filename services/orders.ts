import { request } from "@/lib/apiClient";
import {
  ApiEnvelope,
  Order,
  OrderShipment,
  OrderStatus,
  PaginatedResponse,
  ShipmentStatus,
} from "@/types";

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus | "";
}

export interface OrderInput {
  orderNo: string;
  totalAmount: number;
  customerId: string;
  status?: OrderStatus;
}

export interface ShipmentInput {
  courierId?: string;
  status?: ShipmentStatus;
  trackingNo?: string | null;
}

export async function listOrders(params: ListOrdersParams = {}) {
  const { page = 1, limit = 10, search, status } = params;
  return request<ApiEnvelope<PaginatedResponse<Order>>>("orders", {
    method: "get",
    params: {
      page,
      limit,
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    },
  });
}

export async function getOrder(id: string) {
  return request<ApiEnvelope<Order>>(`orders/${id}`, { method: "get" });
}

export async function createOrder(data: OrderInput) {
  return request<ApiEnvelope<Order>>("orders", { method: "post", data });
}

export async function updateOrder(id: string, data: Partial<OrderInput>) {
  return request<ApiEnvelope<Order>>(`orders/${id}`, { method: "put", data });
}

export async function deleteOrder(id: string) {
  return request<ApiEnvelope<{ id: string }>>(`orders/${id}`, { method: "delete" });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return request<ApiEnvelope<Order>>(`orders/${id}/status`, {
    method: "patch",
    data: { status },
  });
}

export async function addShipment(orderId: string, data: ShipmentInput) {
  return request<ApiEnvelope<OrderShipment>>(`orders/${orderId}/shipments`, {
    method: "post",
    data,
  });
}

export async function updateShipment(
  orderId: string,
  shipmentId: string,
  data: ShipmentInput
) {
  return request<ApiEnvelope<OrderShipment>>(`orders/${orderId}/shipments/${shipmentId}`, {
    method: "put",
    data,
  });
}

export async function deleteShipment(orderId: string, shipmentId: string) {
  return request<ApiEnvelope<{ id: string }>>(`orders/${orderId}/shipments/${shipmentId}`, {
    method: "delete",
  });
}
