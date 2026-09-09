"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Seller } from "@/types";
import { SellerInput } from "@/services/sellers";

export interface SellerFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SellerInput) => void;
  seller?: Seller | null;
  submitting?: boolean;
}

const emptyForm: SellerInput = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
};

export default function SellerFormModal({ open, onClose, onSubmit, seller, submitting }: SellerFormModalProps) {
  const [form, setForm] = useState<SellerInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof SellerInput, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(
        seller
          ? {
              businessName: seller.businessName,
              ownerName: seller.ownerName,
              email: seller.email,
              phone: seller.phone ?? "",
              address: seller.address ?? "",
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, seller]);

  function handleChange(field: keyof SellerInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof SellerInput, string>> = {};
    if (!form.businessName.trim()) next.businessName = "Business name is required";
    if (!form.ownerName.trim()) next.ownerName = "Owner name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Invalid email address";
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
      title={seller ? "Edit Seller" : "Add Seller"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="seller-form" loading={submitting}>
            {seller ? "Save Changes" : "Create Seller"}
          </Button>
        </>
      }
    >
      <form id="seller-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Business Name"
          value={form.businessName}
          onChange={(e) => handleChange("businessName", e.target.value)}
          error={errors.businessName}
        />
        <Input
          label="Owner Name"
          value={form.ownerName}
          onChange={(e) => handleChange("ownerName", e.target.value)}
          error={errors.ownerName}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />
        <Input
          label="Phone"
          value={form.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <Input
          label="Address"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </form>
    </Modal>
  );
}
