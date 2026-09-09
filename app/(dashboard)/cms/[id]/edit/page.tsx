"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/ui/Skeleton";
import { PageError } from "@/components/ui/ErrorState";
import { getCmsPage } from "@/services/cms";
import CmsPageForm from "../../CmsPageForm";

export default function EditCmsPagePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const query = useQuery({
    queryKey: ["cms-page", id],
    queryFn: () => getCmsPage(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-3xl">
        <Skeleton height={24} width="30%" />
        <Skeleton height={40} />
        <Skeleton height={40} />
        <Skeleton height={200} />
      </div>
    );
  }

  if (query.isError || !query.data?.data) {
    return <PageError onRetry={() => query.refetch()} />;
  }

  return <CmsPageForm page={query.data.data} />;
}
