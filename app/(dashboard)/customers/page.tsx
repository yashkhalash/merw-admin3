"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { listCustomers, deleteCustomer } from "@/services/customers";
import { Customer } from "@/types";
import CustomerFormModal from "./CustomerFormModal";

const LIMIT = 10;

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const customersQuery = useQuery({
    queryKey: ["customers", page, debouncedSearch],
    queryFn: async () =>
      (
        await listCustomers({
          page,
          limit: LIMIT,
          ...(debouncedSearch ? { search: debouncedSearch } : {}),
        })
      ).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => {
      toast({
        title: "Customer deleted",
        description: "The customer has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not delete customer. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const data = customersQuery.data?.items ?? [];
  const total = customersQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const columns: DataTableColumn<Customer>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    {
      key: "phone",
      header: "Phone",
      render: (row) => row.phone || <span style={{ color: "var(--color-text-muted)" }}>—</span>,
    },
    {
      key: "orders",
      header: "Orders",
      render: (row) => <Badge variant="neutral">{row._count?.orders ?? 0}</Badge>,
    },
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
              setEditingCustomer(row);
              setFormOpen(true);
            }}
          />
          <IconButton
            aria-label={`Delete ${row.name}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customer Management"
        description="View, add, and manage customers on your marketplace."
        actions={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setEditingCustomer(null);
              setFormOpen(true);
            }}
          >
            Add Customer
          </Button>
        }
      />

      <div className="max-w-sm">
        <Input
          placeholder="Search by name, email, or phone"
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={customersQuery.isLoading}
        error={customersQuery.isError}
        onRetry={() => customersQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No customers found"
      />

      {!customersQuery.isLoading && !customersQuery.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <CustomerFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
        customer={editingCustomer}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          customer={deleteTarget}
          loading={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
        />
      )}
    </div>
  );
}

function ConfirmDeleteModal({
  customer,
  loading,
  onCancel,
  onConfirm,
}: {
  customer: Customer;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open
      onClose={onCancel}
      title="Delete Customer"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </>
      }
    >
      <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
        Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be
        undone.
      </p>
    </Modal>
  );
}
