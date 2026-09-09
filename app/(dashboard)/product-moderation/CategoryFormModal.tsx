"use client";

import React, { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { Category } from "@/types";
import { CategoryInput } from "@/services/categories";

export interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryInput) => void;
  category?: Category | null;
  submitting?: boolean;
}

const emptyForm: CategoryInput = {
  name: "",
  description: "",
};

export default function CategoryFormModal({ open, onClose, onSubmit, category, submitting }: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryInput, string>>>({});

  useEffect(() => {
    if (open) {
      setForm(
        category
          ? { name: category.name, description: category.description ?? "" }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, category]);

  function handleChange(field: keyof CategoryInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof CategoryInput, string>> = {};
    if (!form.name.trim()) next.name = "Name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      description: form.description?.trim() || undefined,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="category-form" loading={submitting}>
            {category ? "Save Changes" : "Create Category"}
          </Button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
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
      </form>
    </Modal>
  );
}
