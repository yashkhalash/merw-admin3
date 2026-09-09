"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import { useToast } from "@/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderStatus } from "@/types";
import { OrderInput, createOrder, deleteOrder, listOrders, updateOrder } from "@/services/orders";
import OrderFormModal from "./OrderFormModal";
import OrderDetailDrawer from "./OrderDetailDrawer";

const PAGE_SIZE = 10;

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const statusBadgeVariant: Record<OrderStatus, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  PROCESSING: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "neutral",
};

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function OrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<OrderStatus | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);

  const queryKey = useMemo(
    () => ["orders", { page, search: debouncedSearch, status }],
    [page, debouncedSearch, status]
  );

  const ordersQuery = useQuery({
    queryKey,
    queryFn: () => listOrders({ page, limit: PAGE_SIZE, search: debouncedSearch, status }),
  });

  const data = ordersQuery.data?.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function invalidateOrders() {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }

  const createMutation = useMutation({
    mutationFn: (input: OrderInput) => createOrder(input),
    onSuccess: () => {
      toast({ title: "Order created", variant: "success" });
      setModalOpen(false);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to create order",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: OrderInput }) => updateOrder(id, input),
    onSuccess: () => {
      toast({ title: "Order updated", variant: "success" });
      setModalOpen(false);
      setEditingOrder(null);
      invalidateOrders();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update order",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      toast({ title: "Order deleted", variant: "success" });
      invalidateOrders();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete order",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  function openCreateModal() {
    setEditingOrder(null);
    setModalOpen(true);
  }

  function openEditModal(order: Order) {
    setEditingOrder(order);
    setModalOpen(true);
  }

  function handleFormSubmit(input: OrderInput) {
    if (editingOrder) {
      updateMutation.mutate({ id: editingOrder.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleDelete(order: Order) {
    if (window.confirm(`Delete order "${order.orderNo}"? This action cannot be undone.`)) {
      deleteMutation.mutate(order.id);
    }
  }

  const columns: DataTableColumn<Order>[] = [
    { key: "orderNo", header: "Order No" },
    { key: "customer", header: "Customer", render: (row) => row.customer?.name || "—" },
    {
      key: "totalAmount",
      header: "Total",
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <Badge variant={statusBadgeVariant[row.status]}>{row.status}</Badge>,
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
          <IconButton aria-label="View order" icon={<Eye size={16} />} onClick={() => setViewingOrderId(row.id)} />
          <IconButton aria-label="Edit order" icon={<Pencil size={16} />} onClick={() => openEditModal(row)} />
          <IconButton aria-label="Delete order" icon={<Trash2 size={16} />} onClick={() => handleDelete(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Order Management"
        description="Track, update, and manage marketplace orders and shipments."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
            Add Order
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <Input
            label="Search"
            placeholder="Search by order number"
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
              setStatus(e.target.value as OrderStatus | "");
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={ordersQuery.isLoading}
        error={ordersQuery.isError}
        onRetry={() => ordersQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No orders found"
      />

      {data && data.total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <OrderFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingOrder(null);
        }}
        onSubmit={handleFormSubmit}
        order={editingOrder}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <OrderDetailDrawer orderId={viewingOrderId} onClose={() => setViewingOrderId(null)} />
    </div>
  );
}
