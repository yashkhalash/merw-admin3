"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { createNotification, updateNotification } from "@/services/notifications";
import { Notification } from "@/types";

export interface NotificationFormModalProps {
  open: boolean;
  onClose: () => void;
  notification?: Notification | null;
}

interface FormState {
  title: string;
  message: string;
}

const emptyForm: FormState = { title: "", message: "" };

export default function NotificationFormModal({
  open,
  onClose,
  notification,
}: NotificationFormModalProps) {
  const isEdit = Boolean(notification);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setForm(
        notification
          ? { title: notification.title, message: notification.message }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, notification]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = { title: form.title.trim(), message: form.message.trim() };
      if (isEdit && notification) {
        return updateNotification(notification.id, payload);
      }
      return createNotification(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Notification updated" : "Notification created",
        description: isEdit
          ? "Notification has been updated successfully."
          : "New notification has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.message.trim()) nextErrors.message = "Message is required";
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
      title={isEdit ? "Edit Notification" : "Add Notification"}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={mutation.isPending}>
            {isEdit ? "Save Changes" : "Create Notification"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          error={errors.title}
          placeholder="System Maintenance"
          required
        />
        <Textarea
          label="Message"
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          error={errors.message}
          placeholder="Describe the notification..."
        />
      </form>
    </Modal>
  );
}
