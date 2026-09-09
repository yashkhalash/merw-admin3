"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, Search, HelpCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { listFaqs, deleteFaq } from "@/services/faqs";
import { Faq } from "@/types";

const PAGE_LIMIT = 10;

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function FaqPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deletingFaq, setDeletingFaq] = useState<Faq | null>(null);

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
    queryKey: ["faqs", page, debouncedSearch],
    queryFn: () =>
      listFaqs({ page, limit: PAGE_LIMIT, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteFaq(id),
    onSuccess: () => {
      toast({
        title: "FAQ deleted",
        description: "The FAQ has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      setDeletingFaq(null);
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

  const columns: DataTableColumn<Faq>[] = [
    { key: "question", header: "Question" },
    { key: "answer", header: "Answer", render: (row) => truncate(row.answer) },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label={`Edit ${row.question}`}
            icon={<Pencil size={16} />}
            onClick={() => router.push(`/faq/${row.id}/edit`)}
          />
          <IconButton
            aria-label={`Delete ${row.question}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingFaq(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="FAQ Management"
        description="Manage frequently asked questions shown to customers."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => router.push("/faq/new")}>
            Add FAQ
          </Button>
        }
      />

      <div className="max-w-xs">
        <Input
          placeholder="Search questions or answers..."
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
        emptyMessage="No FAQs found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(deletingFaq)}
        onClose={() => setDeletingFaq(null)}
        title="Delete FAQ"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingFaq(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingFaq && deleteMutation.mutate(deletingFaq.id)}
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
            <HelpCircle size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete this FAQ? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
