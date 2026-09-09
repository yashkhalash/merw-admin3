"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Eye, Trash2, Search, Mail } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { listEnquiries, deleteEnquiry } from "@/services/enquiries";
import { ContactEnquiry } from "@/types";

const PAGE_LIMIT = 10;

function truncate(text: string, max = 60): string {
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function EnquiriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingEnquiry, setViewingEnquiry] = useState<ContactEnquiry | null>(null);
  const [deletingEnquiry, setDeletingEnquiry] = useState<ContactEnquiry | null>(null);

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
    queryKey: ["enquiries", page, debouncedSearch],
    queryFn: () =>
      listEnquiries({ page, limit: PAGE_LIMIT, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEnquiry(id),
    onSuccess: () => {
      toast({
        title: "Enquiry deleted",
        description: "The enquiry has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["enquiries"] });
      setDeletingEnquiry(null);
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

  const columns: DataTableColumn<ContactEnquiry>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "subject",
      header: "Subject",
      render: (row) => row.subject || "-",
    },
    {
      key: "message",
      header: "Message",
      render: (row) => truncate(row.message),
    },
    {
      key: "createdAt",
      header: "Received",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label={`View enquiry from ${row.name}`}
            icon={<Eye size={16} />}
            onClick={() => setViewingEnquiry(row)}
          />
          <IconButton
            aria-label={`Delete enquiry from ${row.name}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingEnquiry(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contact Enquiries"
        description="View messages submitted through the public contact form."
      />

      <div className="max-w-xs">
        <Input
          placeholder="Search by name, email, or subject..."
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
        emptyMessage="No enquiries found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <Modal
        open={Boolean(viewingEnquiry)}
        onClose={() => setViewingEnquiry(null)}
        title="Enquiry Details"
        footer={
          <Button variant="outline" onClick={() => setViewingEnquiry(null)}>
            Close
          </Button>
        }
      >
        {viewingEnquiry && (
          <div className="flex flex-col gap-4">
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Name
              </p>
              <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
                {viewingEnquiry.name}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Email
              </p>
              <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
                {viewingEnquiry.email}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Subject
              </p>
              <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
                {viewingEnquiry.subject || "-"}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Message
              </p>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: "var(--color-foreground)" }}
              >
                {viewingEnquiry.message}
              </p>
            </div>
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: "var(--color-text-muted)" }}
              >
                Received
              </p>
              <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
                {new Date(viewingEnquiry.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(deletingEnquiry)}
        onClose={() => setDeletingEnquiry(null)}
        title="Delete Enquiry"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingEnquiry(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingEnquiry && deleteMutation.mutate(deletingEnquiry.id)}
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
            <Mail size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete this enquiry? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
