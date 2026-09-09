"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, CheckCheck, BellOff } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { useToast } from "@/providers/ToastProvider";
import {
  listNotifications,
  deleteNotification,
  markNotificationRead,
} from "@/services/notifications";
import { Notification } from "@/types";
import NotificationFormModal from "./NotificationFormModal";

const PAGE_LIMIT = 10;

type ReadFilter = "all" | "unread" | "read";

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [deletingNotification, setDeletingNotification] = useState<Notification | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isRead = readFilter === "all" ? undefined : readFilter === "read";

  const query = useQuery({
    queryKey: ["notifications", page, readFilter],
    queryFn: () => listNotifications({ page, limit: PAGE_LIMIT, isRead }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      toast({
        title: "Notification deleted",
        description: "The notification has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setDeletingNotification(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      toast({
        title: "Marked as read",
        description: "The notification has been marked as read.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({ title: "Update failed", description: message, variant: "error" });
    },
  });

  const items = query.data?.data.items ?? [];
  const total = query.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const columns: DataTableColumn<Notification>[] = [
    { key: "title", header: "Title" },
    {
      key: "message",
      header: "Message",
      render: (row) =>
        row.message.length > 60 ? `${row.message.slice(0, 60)}…` : row.message,
    },
    {
      key: "isRead",
      header: "Status",
      render: (row) => (
        <Badge variant={row.isRead ? "neutral" : "primary"}>
          {row.isRead ? "Read" : "Unread"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {!row.isRead && (
            <IconButton
              aria-label={`Mark ${row.title} as read`}
              icon={<CheckCheck size={16} />}
              onClick={() => markReadMutation.mutate(row.id)}
            />
          )}
          <IconButton
            aria-label={`Edit ${row.title}`}
            icon={<Pencil size={16} />}
            onClick={() => {
              setEditingNotification(row);
              setFormOpen(true);
            }}
          />
          <IconButton
            aria-label={`Delete ${row.title}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingNotification(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notification Management"
        description="Create and manage notifications sent within the platform."
        actions={
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setEditingNotification(null);
              setFormOpen(true);
            }}
          >
            Add Notification
          </Button>
        }
      />

      <div className="max-w-xs">
        <Select
          value={readFilter}
          onChange={(e) => {
            setReadFilter(e.target.value as ReadFilter);
            setPage(1);
          }}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "read", label: "Read" },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No notifications found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <NotificationFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        notification={editingNotification}
      />

      <Modal
        open={Boolean(deletingNotification)}
        onClose={() => setDeletingNotification(null)}
        title="Delete Notification"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingNotification(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() =>
                deletingNotification && deleteMutation.mutate(deletingNotification.id)
              }
            >
              Delete
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center h-10 w-10 rounded-full shrink-0"
            style={{ background: "rgba(220,38,38,0.12)" }}
          >
            <BellOff size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete <strong>{deletingNotification?.title}</strong>? This
            action cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}
