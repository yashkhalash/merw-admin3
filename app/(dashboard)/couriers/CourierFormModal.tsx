"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { createCourier, updateCourier } from "@/services/couriers";
import { Courier } from "@/types";

export interface CourierFormModalProps {
  open: boolean;
  onClose: () => void;
  courier?: Courier | null;
}

interface FormState {
  name: string;
  phone: string;
  email: string;
  serviceArea: string;
}

const emptyForm: FormState = { name: "", phone: "", email: "", serviceArea: "" };

export default function CourierFormModal({ open, onClose, courier }: CourierFormModalProps) {
  const isEdit = Boolean(courier);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        courier
          ? {
              name: courier.name,
              phone: courier.phone || "",
              email: courier.email || "",
              serviceArea: courier.serviceArea || "",
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, courier]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(form.serviceArea.trim() ? { serviceArea: form.serviceArea.trim() } : {}),
      };
      if (isEdit && courier) {
        return updateCourier(courier.id, payload);
      }
      return createCourier(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Courier updated" : "Courier created",
        description: isEdit
          ? "Courier details have been updated successfully."
          : "New courier has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["couriers"] });
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
    if (!form.name.trim()) nextErrors.name = "Name is required";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
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
      title={isEdit ? "Edit Courier" : "Add Courier"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? "Save Changes" : "Create Courier"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          error={errors.name}
          placeholder="Swift Logistics"
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+1 555 000 0000"
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          placeholder="dispatch@courier.com"
        />
        <Input
          label="Service Area"
          value={form.serviceArea}
          onChange={(e) => setForm((f) => ({ ...f, serviceArea: e.target.value }))}
          placeholder="North Region"
        />
      </form>
    </Modal>
  );
}
