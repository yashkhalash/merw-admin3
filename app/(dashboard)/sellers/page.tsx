"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Check, X as XIcon, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/providers/ToastProvider";
import { Seller, SellerApprovalStatus } from "@/types";
import {
  SellerInput,
  createSeller,
  deleteSeller,
  listSellers,
  updateSeller,
  updateSellerApproval,
} from "@/services/sellers";
import SellerFormModal from "./SellerFormModal";

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const statusBadgeVariant: Record<SellerApprovalStatus, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function SellersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<SellerApprovalStatus | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);

  const queryKey = useMemo(
    () => ["sellers", { page, search: debouncedSearch, status }],
    [page, debouncedSearch, status]
  );

  const sellersQuery = useQuery({
    queryKey,
    queryFn: () => listSellers({ page, limit: PAGE_SIZE, search: debouncedSearch, status }),
  });

  const data = sellersQuery.data?.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function invalidateSellers() {
    queryClient.invalidateQueries({ queryKey: ["sellers"] });
  }

  const createMutation = useMutation({
    mutationFn: (input: SellerInput) => createSeller(input),
    onSuccess: () => {
      toast({ title: "Seller created", variant: "success" });
      setModalOpen(false);
      invalidateSellers();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create seller",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: SellerInput }) => updateSeller(id, input),
    onSuccess: () => {
      toast({ title: "Seller updated", variant: "success" });
      setModalOpen(false);
      setEditingSeller(null);
      invalidateSellers();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update seller",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSeller(id),
    onSuccess: () => {
      toast({ title: "Seller deleted", variant: "success" });
      invalidateSellers();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete seller",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const approvalMutation = useMutation({
    mutationFn: ({ id, approvalStatus }: { id: string; approvalStatus: SellerApprovalStatus }) =>
      updateSellerApproval(id, approvalStatus),
    onSuccess: (_res, variables) => {
      toast({
        title: variables.approvalStatus === "APPROVED" ? "Seller approved" : "Seller rejected",
        variant: "success",
      });
      invalidateSellers();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update approval status",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  function openCreateModal() {
    setEditingSeller(null);
    setModalOpen(true);
  }

  function openEditModal(seller: Seller) {
    setEditingSeller(seller);
    setModalOpen(true);
  }

  function handleFormSubmit(input: SellerInput) {
    if (editingSeller) {
      updateMutation.mutate({ id: editingSeller.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleDelete(seller: Seller) {
    if (window.confirm(`Delete seller "${seller.businessName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(seller.id);
    }
  }

  const columns: DataTableColumn<Seller>[] = [
    { key: "businessName", header: "Business Name" },
    { key: "ownerName", header: "Owner" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone", render: (row) => row.phone || "—" },
    {
      key: "approvalStatus",
      header: "Status",
      render: (row) => <Badge variant={statusBadgeVariant[row.approvalStatus]}>{row.approvalStatus}</Badge>,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.approvalStatus === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Check size={14} />}
                onClick={() => approvalMutation.mutate({ id: row.id, approvalStatus: "APPROVED" })}
                loading={approvalMutation.isPending && approvalMutation.variables?.id === row.id && approvalMutation.variables?.approvalStatus === "APPROVED"}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<XIcon size={14} />}
                onClick={() => approvalMutation.mutate({ id: row.id, approvalStatus: "REJECTED" })}
                loading={approvalMutation.isPending && approvalMutation.variables?.id === row.id && approvalMutation.variables?.approvalStatus === "REJECTED"}
              >
                Reject
              </Button>
            </>
          )}
          <IconButton aria-label="Edit seller" icon={<Pencil size={16} />} onClick={() => openEditModal(row)} />
          <IconButton aria-label="Delete seller" icon={<Trash2 size={16} />} onClick={() => handleDelete(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Seller Management"
        description="Review, approve, and manage marketplace sellers."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
            Add Seller
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <Input
            label="Search"
            placeholder="Search by business, owner, or email"
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as SellerApprovalStatus | "");
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={sellersQuery.isLoading}
        error={sellersQuery.isError}
        onRetry={() => sellersQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No sellers found"
      />

      {data && data.total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <SellerFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingSeller(null);
        }}
        onSubmit={handleFormSubmit}
        seller={editingSeller}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
