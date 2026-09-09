"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import Drawer from "@/components/ui/Drawer";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import IconButton from "@/components/ui/IconButton";
import Skeleton from "@/components/ui/Skeleton";
import { useToast } from "@/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import { OrderShipment, OrderStatus, ShipmentStatus } from "@/types";
import {
  ShipmentInput,
  addShipment,
  deleteShipment,
  getOrder,
  updateOrderStatus,
  updateShipment,
} from "@/services/orders";

export interface OrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

const orderStatusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const shipmentStatusOptions: { value: ShipmentStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "PICKED_UP", label: "Picked Up" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "FAILED", label: "Failed" },
];

const orderStatusBadge: Record<OrderStatus, BadgeVariant> = {
  PENDING: "warning",
  CONFIRMED: "primary",
  PROCESSING: "primary",
  SHIPPED: "primary",
  DELIVERED: "success",
  CANCELLED: "danger",
  REFUNDED: "neutral",
};

const shipmentStatusBadge: Record<ShipmentStatus, BadgeVariant> = {
  PENDING: "warning",
  PICKED_UP: "primary",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  FAILED: "danger",
};

function ShipmentForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
}: {
  initial?: Partial<ShipmentInput>;
  onSubmit: (data: ShipmentInput) => void;
  onCancel: () => void;
  submitting?: boolean;
}) {
  const [courierId, setCourierId] = useState(initial?.courierId ?? "");
  const [status, setStatus] = useState<ShipmentStatus>((initial?.status as ShipmentStatus) ?? "PENDING");
  const [trackingNo, setTrackingNo] = useState(initial?.trackingNo ?? "");

  return (
    <div
      className="flex flex-col gap-3 p-3 rounded-md"
      style={{ border: "1px solid var(--color-border)" }}
    >
      <Input
        label="Courier ID"
        placeholder="Courier ID"
        value={courierId}
        onChange={(e) => setCourierId(e.target.value)}
      />
      <Select
        label="Status"
        options={shipmentStatusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value as ShipmentStatus)}
      />
      <Input
        label="Tracking No"
        value={trackingNo ?? ""}
        onChange={(e) => setTrackingNo(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          loading={submitting}
          onClick={() => onSubmit({ courierId, status, trackingNo: trackingNo || null })}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

export default function OrderDetailDrawer({ orderId, onClose }: OrderDetailDrawerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const open = !!orderId;

  const [statusDraft, setStatusDraft] = useState<OrderStatus>("PENDING");
  const [addingShipment, setAddingShipment] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState<string | null>(null);

  const orderQuery = useQuery({
    queryKey: ["orders", orderId, "detail"],
    queryFn: () => getOrder(orderId as string),
    enabled: open,
  });

  const order = orderQuery.data?.data;

  useEffect(() => {
    if (order) setStatusDraft(order.status);
  }, [order]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["orders", orderId, "detail"] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }

  const statusMutation = useMutation({
    mutationFn: () => updateOrderStatus(orderId as string, statusDraft),
    onSuccess: () => {
      toast({ title: "Order status updated", variant: "success" });
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update status",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const addShipmentMutation = useMutation({
    mutationFn: (data: ShipmentInput) => addShipment(orderId as string, data),
    onSuccess: () => {
      toast({ title: "Shipment added", variant: "success" });
      setAddingShipment(false);
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to add shipment",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const updateShipmentMutation = useMutation({
    mutationFn: ({ shipmentId, data }: { shipmentId: string; data: ShipmentInput }) =>
      updateShipment(orderId as string, shipmentId, data),
    onSuccess: () => {
      toast({ title: "Shipment updated", variant: "success" });
      setEditingShipmentId(null);
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to update shipment",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  const deleteShipmentMutation = useMutation({
    mutationFn: (shipmentId: string) => deleteShipment(orderId as string, shipmentId),
    onSuccess: () => {
      toast({ title: "Shipment deleted", variant: "success" });
      invalidate();
    },
    onError: (err: any) => {
      toast({
        title: "Failed to delete shipment",
        description: err?.response?.data?.message,
        variant: "error",
      });
    },
  });

  function handleDeleteShipment(shipment: OrderShipment) {
    if (window.confirm("Delete this shipment? This action cannot be undone.")) {
      deleteShipmentMutation.mutate(shipment.id);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title={order ? `Order ${order.orderNo}` : "Order Detail"} widthClassName="max-w-lg">
      {orderQuery.isLoading && (
        <div className="flex flex-col gap-3">
          <Skeleton height={20} />
          <Skeleton height={20} />
          <Skeleton height={80} />
        </div>
      )}

      {orderQuery.isError && (
        <p className="text-sm" style={{ color: "#dc2626" }}>
          Failed to load order details.
        </p>
      )}

      {order && (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Customer
            </h3>
            <p className="text-sm">{order.customer?.name ?? "—"}</p>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              {order.customer?.email ?? "—"}
            </p>
            <p className="text-sm">Total: {formatCurrency(order.totalAmount)}</p>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Status
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant={orderStatusBadge[order.status]}>{order.status}</Badge>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Select
                  options={orderStatusOptions}
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as OrderStatus)}
                />
              </div>
              <Button
                size="sm"
                leftIcon={<Check size={14} />}
                loading={statusMutation.isPending}
                disabled={statusDraft === order.status}
                onClick={() => statusMutation.mutate()}
              >
                Save
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
                Shipments
              </h3>
              {!addingShipment && (
                <Button size="sm" variant="outline" leftIcon={<Plus size={14} />} onClick={() => setAddingShipment(true)}>
                  Add Shipment
                </Button>
              )}
            </div>

            {addingShipment && (
              <ShipmentForm
                onCancel={() => setAddingShipment(false)}
                submitting={addShipmentMutation.isPending}
                onSubmit={(data) => addShipmentMutation.mutate(data)}
              />
            )}

            {(order.shipments ?? []).length === 0 && !addingShipment && (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No shipments yet.
              </p>
            )}

            <div className="flex flex-col gap-2">
              {(order.shipments ?? []).map((shipment) =>
                editingShipmentId === shipment.id ? (
                  <ShipmentForm
                    key={shipment.id}
                    initial={{
                      courierId: shipment.courierId,
                      status: shipment.status,
                      trackingNo: shipment.trackingNo,
                    }}
                    submitting={updateShipmentMutation.isPending}
                    onCancel={() => setEditingShipmentId(null)}
                    onSubmit={(data) => updateShipmentMutation.mutate({ shipmentId: shipment.id, data })}
                  />
                ) : (
                  <div
                    key={shipment.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-md"
                    style={{ border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {shipment.courier?.name ?? shipment.courierId}
                      </span>
                      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Tracking: {shipment.trackingNo || "—"}
                      </span>
                      <Badge variant={shipmentStatusBadge[shipment.status]} className="w-fit">
                        {shipment.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        aria-label="Edit shipment"
                        icon={<Pencil size={14} />}
                        onClick={() => setEditingShipmentId(shipment.id)}
                      />
                      <IconButton
                        aria-label="Delete shipment"
                        icon={<Trash2 size={14} />}
                        onClick={() => handleDeleteShipment(shipment)}
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Transactions
            </h3>
            {(order.transactions ?? []).length === 0 && (
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                No transactions yet.
              </p>
            )}
            <div className="flex flex-col gap-2">
              {(order.transactions ?? []).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-md"
                  style={{ border: "1px solid var(--color-border)" }}
                >
                  <span className="text-sm">{formatCurrency(tx.amount)}</span>
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {tx.reference || "—"}
                  </span>
                  <Badge variant="neutral">{tx.status}</Badge>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Drawer>
  );
}
