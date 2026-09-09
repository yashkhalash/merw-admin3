"use client";

import React, { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Button from "@/components/ui/Button";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/providers/ToastProvider";
import {
  listCommissions,
  createCommission,
  updateCommission,
  deleteCommission,
} from "@/services/commissions";
import { Commission } from "@/types";

const LIMIT = 10;

const Muted = () => <span style={{ color: "var(--color-text-muted)" }}>—</span>;

export default function CommissionsTab() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Commission | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Commission | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const commissionsQuery = useQuery({
    queryKey: ["commissions", page],
    queryFn: async () => (await listCommissions({ page, limit: LIMIT })).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCommission(id),
    onSuccess: () => {
      toast({ title: "Commission deleted", description: "The commission has been removed.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      setDeleteTarget(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not delete commission. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const data = commissionsQuery.data?.items ?? [];
  const total = commissionsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const columns: DataTableColumn<Commission>[] = [
    { key: "rate", header: "Rate (%)", render: (row) => `${row.rate}%` },
    { key: "seller", header: "Seller", render: (row) => row.seller?.businessName ?? <Muted /> },
    { key: "category", header: "Category", render: (row) => row.category?.name ?? <Muted /> },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton
            aria-label={`Edit commission ${row.id}`}
            icon={<Pencil size={16} />}
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          />
          <IconButton
            aria-label={`Delete commission ${row.id}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeleteTarget(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add Commission
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={commissionsQuery.isLoading}
        error={commissionsQuery.isError}
        onRetry={() => commissionsQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No commissions found"
      />

      {!commissionsQuery.isLoading && !commissionsQuery.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <CommissionFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        commission={editing}
      />

      {deleteTarget && (
        <Modal
          open
          onClose={() => setDeleteTarget(null)}
          title="Delete Commission"
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
            Are you sure you want to delete this commission rule? This action cannot be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

interface FormState {
  rate: string;
  sellerId: string;
  categoryId: string;
}

const emptyForm: FormState = { rate: "", sellerId: "", categoryId: "" };

function CommissionFormModal({
  open,
  onClose,
  commission,
}: {
  open: boolean;
  onClose: () => void;
  commission?: Commission | null;
}) {
  const isEdit = Boolean(commission);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        commission
          ? {
              rate: String(commission.rate),
              sellerId: commission.sellerId ?? "",
              categoryId: commission.categoryId ?? "",
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, commission]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        rate: Number(form.rate),
        sellerId: form.sellerId.trim() || null,
        categoryId: form.categoryId.trim() || null,
      };
      if (isEdit && commission) {
        return updateCommission(commission.id, payload);
      }
      return createCommission(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Commission updated" : "Commission created",
        description: isEdit ? "Commission has been updated successfully." : "New commission has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
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
    const rateNum = Number(form.rate);
    if (!form.rate.trim() || Number.isNaN(rateNum)) {
      nextErrors.rate = "Rate is required";
    } else if (rateNum < 0 || rateNum > 999.99) {
      nextErrors.rate = "Rate must be between 0 and 999.99";
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
      title={isEdit ? "Edit Commission" : "Add Commission"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? "Save Changes" : "Create Commission"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Rate (%)"
          type="number"
          step="0.01"
          value={form.rate}
          onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
          error={errors.rate}
          placeholder="e.g. 5.00"
          required
        />
        <Input
          label="Seller ID"
          value={form.sellerId}
          onChange={(e) => setForm((f) => ({ ...f, sellerId: e.target.value }))}
          placeholder="Optional — leave blank to apply to all sellers"
        />
        <Input
          label="Category ID"
          value={form.categoryId}
          onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          placeholder="Optional — leave blank to apply to all categories"
        />
      </form>
    </Modal>
  );
}
