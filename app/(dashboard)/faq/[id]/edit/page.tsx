"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "@/components/ui/Skeleton";
import { PageError } from "@/components/ui/ErrorState";
import { getFaq } from "@/services/faqs";
import FaqForm from "../../FaqForm";

export default function EditFaqPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const query = useQuery({
    queryKey: ["faq", id],
    queryFn: () => getFaq(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-2xl">
        <Skeleton height={24} width="30%" />
        <Skeleton height={40} />
        <Skeleton height={140} />
      </div>
    );
  }

  if (query.isError || !query.data?.data) {
    return <PageError onRetry={() => query.refetch()} />;
  }

  return <FaqForm faq={query.data.data} />;
}
