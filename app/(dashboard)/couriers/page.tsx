"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, Search, Truck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { listCouriers, deleteCourier } from "@/services/couriers";
import { Courier } from "@/types";
import CourierFormModal from "./CourierFormModal";

const PAGE_LIMIT = 10;

export default function CouriersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [deletingCourier, setDeletingCourier] = useState<Courier | null>(null);

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
    queryKey: ["couriers", page, debouncedSearch],
    queryFn: () =>
      listCouriers({ page, limit: PAGE_LIMIT, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCourier(id),
    onSuccess: () => {
      toast({
        title: "Courier deleted",
        description: "The courier has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
      setDeletingCourier(null);
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

  const columns: DataTableColumn<Courier>[] = [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone", render: (row) => row.phone || "—" },
    { key: "email", header: "Email", render: (row) => row.email || "—" },
    { key: "serviceArea", header: "Service Area", render: (row) => row.serviceArea || "—" },
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
            aria-label={`Edit ${row.name}`}
            icon={<Pencil size={16} />}
            onClick={() => {
              setEditingCourier(row);
              setFormOpen(true);
            }}
          />
          <IconButton
            aria-label={`Delete ${row.name}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingCourier(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Courier Management"
        description="Manage delivery couriers and their service areas."
        actions={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setEditingCourier(null);
              setFormOpen(true);
            }}
          >
            Add Courier
          </Button>
        }
      />

      <div className="max-w-xs">
        <Input
          placeholder="Search by name, email or area..."
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
        emptyMessage="No couriers found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <CourierFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        courier={editingCourier}
      />

      <Modal
        open={Boolean(deletingCourier)}
        onClose={() => setDeletingCourier(null)}
        title="Delete Courier"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingCourier(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingCourier && deleteMutation.mutate(deletingCourier.id)}
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
            <Truck size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete{" "}
            <strong>{deletingCourier?.name}</strong>? This action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
