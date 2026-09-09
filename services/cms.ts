import { request } from "@/lib/apiClient";
import { ApiEnvelope, CmsPage, PaginatedResponse } from "@/types";

export interface ListCmsPagesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface CmsPageInput {
  slug: string;
  title: string;
  content: string;
}

export async function listCmsPages(params: ListCmsPagesParams = {}) {
  return request<ApiEnvelope<PaginatedResponse<CmsPage>>>("cms", {
    method: "get",
    params,
  });
}

export async function getCmsPage(id: string) {
  return request<ApiEnvelope<CmsPage>>(`cms/${id}`, {
    method: "get",
  });
}

export async function getCmsPageBySlug(slug: string) {
  return request<ApiEnvelope<CmsPage>>(`cms/slug/${slug}`, {
    method: "get",
  });
}

export async function createCmsPage(data: CmsPageInput) {
  return request<ApiEnvelope<CmsPage>>("cms", {
    method: "post",
    data,
  });
}

export async function updateCmsPage(id: string, data: Partial<CmsPageInput>) {
  return request<ApiEnvelope<CmsPage>>(`cms/${id}`, {
    method: "put",
    data,
  });
}

export async function deleteCmsPage(id: string) {
  return request<ApiEnvelope<CmsPage>>(`cms/${id}`, {
    method: "delete",
  });
}
