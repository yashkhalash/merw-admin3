"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { createAdminUser, updateAdminUser, listRoles } from "@/services/roles";
import { AdminUser } from "@/types";

export interface AdminUserFormModalProps {
  open: boolean;
  onClose: () => void;
  adminUser?: AdminUser | null;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

const emptyForm: FormState = { name: "", email: "", password: "", roleId: "" };

export default function AdminUserFormModal({ open, onClose, adminUser }: AdminUserFormModalProps) {
  const isEdit = Boolean(adminUser);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: ["roles", "all-for-select"],
    queryFn: () => listRoles({ page: 1, limit: 100 }),
    enabled: open,
  });

  const roleOptions = (rolesQuery.data?.data.items ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }));

  useEffect(() => {
    if (open) {
      setForm(
        adminUser
          ? {
              name: adminUser.name,
              email: adminUser.email,
              password: "",
              roleId: adminUser.roleId || "",
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, adminUser]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: form.roleId || null,
        ...(form.password.trim() ? { password: form.password.trim() } : {}),
      };
      if (isEdit && adminUser) {
        return updateAdminUser(adminUser.id, payload);
      }
      return createAdminUser({ ...payload, password: form.password.trim() });
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Admin user updated" : "Admin user created",
        description: isEdit
          ? "Admin user details have been updated successfully."
          : "New admin user has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address";
    }
    if (!isEdit && form.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }
    if (isEdit && form.password.trim() && form.password.trim().length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
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
      title={isEdit ? "Edit Admin User" : "Add Admin User"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? "Save Changes" : "Create Admin User"}
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
          label={isEdit ? "Password (leave blank to keep current)" : "Password"}
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          error={errors.password}
          placeholder="••••••••"
          required={!isEdit}
        />
        <Select
          label="Role"
          value={form.roleId}
          onChange={(e) => setForm((f) => ({ ...f, roleId: e.target.value }))}
          options={roleOptions}
          placeholder="Select a role"
        />
      </form>
    </Modal>
  );
}
