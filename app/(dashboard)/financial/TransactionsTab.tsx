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
  listTransactions,
  createTransaction,
  updateTransactionStatus,
  deleteTransaction,
} from "@/services/transactions";
import { Transaction, TransactionStatus } from "@/types";

const LIMIT = 10;

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const STATUS_BADGE: Record<TransactionStatus, BadgeVariant> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "danger",
  REFUNDED: "neutral",
};

const Muted = () => <span style={{ color: "var(--color-text-muted)" }}>—</span>;

export default function TransactionsTab() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: ["transactions", page, statusFilter],
    queryFn: async () =>
      (
        await listTransactions({
          page,
          limit: LIMIT,
          ...(statusFilter ? { status: statusFilter as TransactionStatus } : {}),
        })
      ).data,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TransactionStatus }) => updateTransactionStatus(id, status),
    onSuccess: () => {
      toast({ title: "Status updated", description: "Transaction status has been updated.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not update status. Please try again.";
      toast({ title: "Update failed", description: message, variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      toast({ title: "Transaction deleted", description: "The transaction has been removed.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not delete transaction. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const data = transactionsQuery.data?.items ?? [];
  const total = transactionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const columns: DataTableColumn<Transaction>[] = [
    { key: "order", header: "Order No.", render: (row) => row.order?.orderNo ?? <Muted /> },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount) },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={STATUS_BADGE[row.status]}>{row.status}</Badge>
          <Select
            aria-label={`Change status for transaction ${row.id}`}
            className="w-36"
            options={STATUS_OPTIONS}
            value={row.status}
            onChange={(e) => statusMutation.mutate({ id: row.id, status: e.target.value as TransactionStatus })}
          />
        </div>
      ),
    },
    { key: "reference", header: "Reference", render: (row) => row.reference ?? <Muted /> },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label={`Delete transaction ${row.id}`}
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
          Add Transaction
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={transactionsQuery.isLoading}
        error={transactionsQuery.isError}
        onRetry={() => transactionsQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No transactions found"
      />

      {!transactionsQuery.isLoading && !transactionsQuery.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} />

      {deleteTarget && (
        <Modal
          open
          onClose={() => setDeleteTarget(null)}
          title="Delete Transaction"
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
            Are you sure you want to delete this transaction? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

interface FormState {
  orderId: string;
  amount: string;
  status: TransactionStatus;
  reference: string;
}

const emptyForm: FormState = { orderId: "", amount: "", status: "PENDING", reference: "" };

function TransactionFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      createTransaction({
        orderId: form.orderId.trim(),
        amount: Number(form.amount),
        status: form.status,
        ...(form.reference.trim() ? { reference: form.reference.trim() } : {}),
      }),
    onSuccess: () => {
      toast({ title: "Transaction created", description: "New transaction has been added successfully.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
    if (!form.orderId.trim()) nextErrors.orderId = "Order ID is required";
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
      title="Add Transaction"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            Create Transaction
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Order ID"
          value={form.orderId}
          onChange={(e) => setForm((f) => ({ ...f, orderId: e.target.value }))}
          error={errors.orderId}
          placeholder="Order ID"
          required
        />
        <Input
          label="Amount"
          type="number"
          step="0.01"
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          error={errors.amount}
          placeholder="e.g. 99.99"
          required
        />
        <Input
          label="Reference"
          value={form.reference}
          onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
          placeholder="Optional payment reference"
        />
        <Select
          label="Status"
          options={STATUS_OPTIONS}
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as TransactionStatus }))}
        />
      </form>
    </Modal>
  );
}
