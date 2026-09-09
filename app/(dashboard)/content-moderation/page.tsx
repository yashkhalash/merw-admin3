"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Check, X, Store, Package } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { PageError } from "@/components/ui/ErrorState";
import { useToast } from "@/providers/ToastProvider";
import { listSellers, updateSellerApproval } from "@/services/sellers";
import { listProducts, updateProductModeration } from "@/services/products";
import { formatCurrency } from "@/lib/utils";

function useErrorMessage() {
  return (err: unknown, fallback: string) =>
    (err as AxiosError<{ message?: string }>)?.response?.data?.message || fallback;
}

function PendingSellersSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const getMessage = useErrorMessage();

  const query = useQuery({
    queryKey: ["content-moderation", "sellers"],
    queryFn: () => listSellers({ page: 1, limit: 20, status: "PENDING" }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      updateSellerApproval(id, status),
    onSuccess: (_data, vars) => {
      toast({
        title: vars.status === "APPROVED" ? "Seller approved" : "Seller rejected",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["content-moderation", "sellers"] });
      queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
    onError: (err) => {
      toast({ title: "Action failed", description: getMessage(err, "Could not update seller."), variant: "error" });
    },
  });

  const sellers = query.data?.data?.items || [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Store size={16} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
          Pending Sellers
        </h2>
        <Badge variant="warning">{sellers.length}</Badge>
      </div>

      {query.isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={64} />
          ))}
        </div>
      )}

      {query.isError && <PageError onRetry={() => query.refetch()} />}

      {!query.isLoading && !query.isError && sellers.length === 0 && (
        <EmptyState title="No sellers pending review" description="New seller applications will show up here." />
      )}

      {!query.isLoading && !query.isError && sellers.length > 0 && (
        <div className="flex flex-col gap-2">
          {sellers.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{s.businessName}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{s.ownerName} · {s.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={approveMutation.isPending && approveMutation.variables?.id === s.id && approveMutation.variables?.status === "REJECTED"}
                  onClick={() => approveMutation.mutate({ id: s.id, status: "REJECTED" })}
                >
                  <X size={14} /> Reject
                </Button>
                <Button
                  size="sm"
                  loading={approveMutation.isPending && approveMutation.variables?.id === s.id && approveMutation.variables?.status === "APPROVED"}
                  onClick={() => approveMutation.mutate({ id: s.id, status: "APPROVED" })}
                >
                  <Check size={14} /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function PendingProductsSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const getMessage = useErrorMessage();

  const query = useQuery({
    queryKey: ["content-moderation", "products"],
    queryFn: () => listProducts({ page: 1, limit: 20, moderationStatus: "PENDING" }),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "APPROVED" | "REJECTED" }) =>
      updateProductModeration(id, status),
    onSuccess: (_data, vars) => {
      toast({
        title: vars.status === "APPROVED" ? "Product approved" : "Product rejected",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["content-moderation", "products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      toast({ title: "Action failed", description: getMessage(err, "Could not update product."), variant: "error" });
    },
  });

  const products = query.data?.data?.items || [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Package size={16} style={{ color: "var(--color-primary)" }} />
        <h2 className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
          Pending Products
        </h2>
        <Badge variant="warning">{products.length}</Badge>
      </div>

      {query.isLoading && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={64} />
          ))}
        </div>
      )}

      {query.isError && <PageError onRetry={() => query.refetch()} />}

      {!query.isLoading && !query.isError && products.length === 0 && (
        <EmptyState title="No products pending review" description="Newly listed products will show up here." />
      )}

      {!query.isLoading && !query.isError && products.length > 0 && (
        <div className="flex flex-col gap-2">
          {products.map((p) => (
            <Card key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{p.name}</p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {p.category?.name || "Uncategorized"} · {formatCurrency(Number(p.price))} · {p.seller?.businessName || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  loading={moderateMutation.isPending && moderateMutation.variables?.id === p.id && moderateMutation.variables?.status === "REJECTED"}
                  onClick={() => moderateMutation.mutate({ id: p.id, status: "REJECTED" })}
                >
                  <X size={14} /> Reject
                </Button>
                <Button
                  size="sm"
                  loading={moderateMutation.isPending && moderateMutation.variables?.id === p.id && moderateMutation.variables?.status === "APPROVED"}
                  onClick={() => moderateMutation.mutate({ id: p.id, status: "APPROVED" })}
                >
                  <Check size={14} /> Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ContentModerationPage() {
  return (
    <div>
      <PageHeader
        title="Content Moderation"
        description="A unified queue of sellers and products awaiting approval."
      />
      <div className="flex flex-col gap-8">
        <PendingSellersSection />
        <PendingProductsSection />
      </div>
    </div>
  );
}
