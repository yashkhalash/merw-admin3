"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { createRole, updateRole } from "@/services/roles";
import { Role } from "@/types";

export interface RoleFormModalProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
}

interface FormState {
  name: string;
  permissions: string;
}

const emptyForm: FormState = { name: "", permissions: "{}" };

export default function RoleFormModal({ open, onClose, role }: RoleFormModalProps) {
  const isEdit = Boolean(role);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        role
          ? {
              name: role.name,
              permissions: JSON.stringify(role.permissions ?? {}, null, 2),
            }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, role]);

  const mutation = useMutation({
    mutationFn: async () => {
      const permissions = JSON.parse(form.permissions);
      const payload = { name: form.name.trim(), permissions };
      if (isEdit && role) {
        return updateRole(role.id, payload);
      }
      return createRole(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Role updated" : "Role created",
        description: isEdit
          ? "Role details have been updated successfully."
          : "New role has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
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
    try {
      const parsed = JSON.parse(form.permissions);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        nextErrors.permissions = "Permissions must be a JSON object";
      }
    } catch {
      nextErrors.permissions = "Invalid JSON";
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
      title={isEdit ? "Edit Role" : "Add Role"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? "Save Changes" : "Create Role"}
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
          placeholder="Editor"
          required
        />
        <Textarea
          label="Permissions (JSON)"
          value={form.permissions}
          onChange={(e) => setForm((f) => ({ ...f, permissions: e.target.value }))}
          error={errors.permissions}
          placeholder='{"products": ["read", "write"]}'
          rows={8}
        />
      </form>
    </Modal>
  );
}
