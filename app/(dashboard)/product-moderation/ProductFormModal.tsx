"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { Category, Product } from "@/types";
import { ProductInput } from "@/services/products";

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  stock: string;
  sellerId: string;
  categoryId: string;
}

export interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductInput) => void;
  product?: Product | null;
  categories: Category[];
  submitting?: boolean;
}

const emptyForm: ProductFormValues = {
  name: "",
  description: "",
  price: "",
  stock: "",
  sellerId: "",
  categoryId: "",
};

export default function ProductFormModal({ open, onClose, onSubmit, product, categories, submitting }: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(
        product
          ? {
              name: product.name,
              description: product.description ?? "",
              price: String(product.price),
              stock: String(product.stock),
              sellerId: product.sellerId,
              categoryId: product.categoryId,
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, product]);

  function handleChange(field: keyof ProductFormValues, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ProductFormValues, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.price.trim() || Number.isNaN(Number(form.price)) || Number(form.price) < 0) {
      next.price = "Enter a valid price";
    }
    if (!form.stock.trim() || Number.isNaN(Number(form.stock)) || Number(form.stock) < 0) {
      next.stock = "Enter a valid stock quantity";
    }
    if (!form.sellerId.trim()) next.sellerId = "Seller ID is required";
    if (!form.categoryId.trim()) next.categoryId = "Category is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      sellerId: form.sellerId.trim(),
      categoryId: form.categoryId,
    });
  }

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Edit Product" : "Add Product"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="product-form" loading={submitting}>
            {product ? "Save Changes" : "Create Product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <Input
          label="Price"
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => handleChange("price", e.target.value)}
          error={errors.price}
        />
        <Input
          label="Stock"
          type="number"
          min="0"
          value={form.stock}
          onChange={(e) => handleChange("stock", e.target.value)}
          error={errors.stock}
        />
        <Select
          label="Category"
          placeholder="Select a category"
          options={categoryOptions}
          value={form.categoryId}
          onChange={(e) => handleChange("categoryId", e.target.value)}
          error={errors.categoryId}
        />
        <Input
          label="Seller ID"
          placeholder="Seller ID"
          hint="Seller picker is not yet available — enter the seller's ID directly."
          value={form.sellerId}
          onChange={(e) => handleChange("sellerId", e.target.value)}
          error={errors.sellerId}
        />
      </form>
    </Modal>
  );
}
