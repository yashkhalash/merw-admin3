"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Order, OrderStatus } from "@/types";
import { OrderInput } from "@/services/orders";

export interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: OrderInput) => void;
  order?: Order | null;
  submitting?: boolean;
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

const emptyForm: OrderInput = {
  orderNo: "",
  totalAmount: 0,
  customerId: "",
  status: "PENDING",
};

export default function OrderFormModal({ open, onClose, onSubmit, order, submitting }: OrderFormModalProps) {
  const [form, setForm] = useState<OrderInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof OrderInput, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(
        order
          ? {
              orderNo: order.orderNo,
              totalAmount: order.totalAmount,
              customerId: order.customerId,
              status: order.status,
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, order]);

  function handleChange<K extends keyof OrderInput>(field: K, value: OrderInput[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof OrderInput, string>> = {};
    if (!form.orderNo.trim()) next.orderNo = "Order number is required";
    if (!form.customerId.trim()) next.customerId = "Customer ID is required";
    if (form.totalAmount === null || form.totalAmount === undefined || Number.isNaN(form.totalAmount)) {
      next.totalAmount = "Total amount is required";
    } else if (form.totalAmount < 0) {
      next.totalAmount = "Total amount cannot be negative";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={order ? "Edit Order" : "Add Order"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="order-form" loading={submitting}>
            {order ? "Save Changes" : "Create Order"}
          </Button>
        </>
      }
    >
      <form id="order-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Order Number"
          value={form.orderNo}
          onChange={(e) => handleChange("orderNo", e.target.value)}
          error={errors.orderNo}
        />
        <Input
          label="Customer ID"
          placeholder="Customer ID"
          value={form.customerId}
          onChange={(e) => handleChange("customerId", e.target.value)}
          error={errors.customerId}
        />
        <Input
          label="Total Amount"
          type="number"
          step="0.01"
          min="0"
          value={String(form.totalAmount)}
          onChange={(e) => handleChange("totalAmount", parseFloat(e.target.value))}
          error={errors.totalAmount}
        />
        <Select
          label="Status"
          options={statusOptions}
          value={form.status ?? "PENDING"}
          onChange={(e) => handleChange("status", e.target.value as OrderStatus)}
        />
      </form>
    </Modal>
  );
}
