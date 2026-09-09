"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { createCustomer, updateCustomer } from "@/services/customers";
import { Customer } from "@/types";

export interface CustomerFormModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
}

const emptyForm: FormState = { name: "", email: "", phone: "" };

export default function CustomerFormModal({ open, onClose, customer }: CustomerFormModalProps) {
  const isEdit = Boolean(customer);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        customer
          ? { name: customer.name, email: customer.email, phone: customer.phone || "" }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, customer]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      };
      if (isEdit && customer) {
        return updateCustomer(customer.id, payload);
      }
      return createCustomer(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Customer updated" : "Customer created",
        description: isEdit
          ? "Customer details have been updated successfully."
          : "New customer has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
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
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
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
      title={isEdit ? "Edit Customer" : "Add Customer"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? "Save Changes" : "Create Customer"}
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
          placeholder="Jane Doe"
          required
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          error={errors.email}
          placeholder="jane@example.com"
          required
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+1 555 000 0000"
        />
      </form>
    </Modal>
  );
}
