"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, Search, FileText } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { listCmsPages, deleteCmsPage } from "@/services/cms";
import { CmsPage } from "@/types";

const PAGE_LIMIT = 10;

export default function CmsPagesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingPage, setDeletingPage] = useState<CmsPage | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const query = useQuery({
    queryKey: ["cms-pages", page, debouncedSearch],
    queryFn: () =>
      listCmsPages({ page, limit: PAGE_LIMIT, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCmsPage(id),
    onSuccess: () => {
      toast({
        title: "Page deleted",
        description: "The CMS page has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      setDeletingPage(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const items = query.data?.data.items ?? [];
  const total = query.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const columns: DataTableColumn<CmsPage>[] = [
    { key: "slug", header: "Slug" },
    { key: "title", header: "Title" },
    {
      key: "updatedAt",
      header: "Updated",
      render: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label={`Edit ${row.title}`}
            icon={<Pencil size={16} />}
            onClick={() => router.push(`/cms/${row.id}/edit`)}
          />
          <IconButton
            aria-label={`Delete ${row.title}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingPage(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="CMS Pages"
        description="Manage static content pages shown across the storefront."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => router.push("/cms/new")}>
            Add Page
          </Button>
        }
      />

      <div className="max-w-xs">
        <Input
          placeholder="Search by slug or title..."
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No CMS pages found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(deletingPage)}
        onClose={() => setDeletingPage(null)}
        title="Delete Page"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingPage(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingPage && deleteMutation.mutate(deletingPage.id)}
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center h-10 w-10 rounded-full shrink-0"
            style={{ background: "rgba(220,38,38,0.12)" }}
          >
            <FileText size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete <strong>{deletingPage?.title}</strong>? This action
            cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
