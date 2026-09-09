"use client";

import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import IconButton from "@/components/ui/IconButton";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import {
  listPayouts,
  createPayout,
  updatePayoutStatus,
  deletePayout,
} from "@/services/payouts";
import { Payout, PayoutStatus } from "@/types";

const LIMIT = 10;

const STATUS_OPTIONS: { value: PayoutStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "PAID", label: "Paid" },
  { value: "FAILED", label: "Failed" },
];

const STATUS_BADGE: Record<PayoutStatus, BadgeVariant> = {
  PENDING: "warning",
  PROCESSING: "primary",
  PAID: "success",
  FAILED: "danger",
};

const Muted = () => <span style={{ color: "var(--color-text-muted)" }}>—</span>;

export default function PayoutsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Payout | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const payoutsQuery = useQuery({
    queryKey: ["payouts", page, statusFilter],
    queryFn: async () =>
      (
        await listPayouts({
          page,
          limit: LIMIT,
          ...(statusFilter ? { status: statusFilter as PayoutStatus } : {}),
        })
      ).data,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PayoutStatus }) => updatePayoutStatus(id, status),
    onSuccess: () => {
      toast({ title: "Status updated", description: "Payout status has been updated.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not update status. Please try again.";
      toast({ title: "Update failed", description: message, variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePayout(id),
    onSuccess: () => {
      toast({ title: "Payout deleted", description: "The payout has been removed.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not delete payout. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const data = payoutsQuery.data?.items ?? [];
  const total = payoutsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const columns: DataTableColumn<Payout>[] = [
    { key: "seller", header: "Seller", render: (row) => row.seller?.businessName ?? <Muted /> },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
          <Select
            aria-label={`Change status for payout ${row.id}`}
            className="w-36"
            options={STATUS_OPTIONS}
            value={row.status}
            onChange={(e) => statusMutation.mutate({ id: row.id, status: e.target.value as PayoutStatus })}
          />
        </div>
      ),
    },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label={`Delete payout ${row.id}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="max-w-xs w-full">
          <Select
            placeholder="All statuses"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setFormOpen(true)}>
          Add Payout
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={payoutsQuery.isLoading}
        error={payoutsQuery.isError}
        onRetry={() => payoutsQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No payouts found"
      />

      {!payoutsQuery.isLoading && !payoutsQuery.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <PayoutFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      {deleteTarget && (
        <Modal
          open
          onClose={() => setDeleteTarget(null)}
          title="Delete Payout"
          size="sm"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
                Cancel
              </Button>
              <Button variant="danger" onClick={() => deleteMutation.mutate(deleteTarget.id)} loading={deleteMutation.isPending}>
                Delete
              </Button>
            </>
          }
        >
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete this payout record? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

interface FormState {
  sellerId: string;
  amount: string;
  status: PayoutStatus;
}

const emptyForm: FormState = { sellerId: "", amount: "", status: "PENDING" };

function PayoutFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setErrors({});
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: async () =>
      createPayout({
        sellerId: form.sellerId.trim(),
        amount: Number(form.amount),
        status: form.status,
      }),
    onSuccess: () => {
      toast({ title: "Payout created", description: "New payout has been added successfully.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["payouts"] });
      onClose();
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({ title: "Request failed", description: message, variant: "error" });
    },
  });

  function validate(): boolean {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.sellerId.trim()) nextErrors.sellerId = "Seller ID is required";
    const amountNum = Number(form.amount);
    if (!form.amount.trim() || Number.isNaN(amountNum) || amountNum < 0) {
      nextErrors.amount = "Enter a valid amount";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Payout"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            Create Payout
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Seller ID"
          value={form.sellerId}
          onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))}
          error={errors.sellerId}
          placeholder="Seller ID"
          required
        />
        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          error={errors.amount}
          placeholder="e.g. 250.00"
          required
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as PayoutStatus }))}
        />
      </form>
    </Modal>
  );
}
