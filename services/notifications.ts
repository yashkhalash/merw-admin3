import { request } from "@/lib/apiClient";
import { ApiEnvelope, Notification, PaginatedResponse } from "@/types";

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationInput {
  title: string;
  message: string;
}

export async function listNotifications(params: ListNotificationsParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<Notification>>>("notifications", {
    method: "get",
    params,
  });
}

export async function getNotification(id: string) {
  return request<ApiEnvelope<Notification>>(`notifications/${id}`, {
    method: "get",
  });
}

export async function createNotification(data: NotificationInput) {
  return request<ApiEnvelope<Notification>>("notifications", {
    method: "post",
    data,
  });
}

export async function updateNotification(
  id: string,
  data: Partial<NotificationInput & { isRead: boolean }>
) {
  return request<ApiEnvelope<Notification>>(`notifications/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteNotification(id: string) {
  return request<ApiEnvelope<Notification>>(`notifications/${id}`, {
    method: "delete",
  });
}

export async function markNotificationRead(id: string) {
  return request<ApiEnvelope<Notification>>(`notifications/${id}/read`, {
    method: "patch",
  });
}
