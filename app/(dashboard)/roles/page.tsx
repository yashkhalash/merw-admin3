"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Plus, Pencil, Trash2, ShieldAlert, UserX } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Tabs from "@/components/ui/Tabs";
import { useToast } from "@/providers/ToastProvider";
import { listRoles, deleteRole, listAdminUsers, deleteAdminUser } from "@/services/roles";
import { AdminUser, Role } from "@/types";
import RoleFormModal from "./RoleFormModal";
import AdminUserFormModal from "./AdminUserFormModal";

const PAGE_LIMIT = 10;

function RolesTab() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["roles", page],
    queryFn: () => listRoles({ page, limit: PAGE_LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast({
        title: "Role deleted",
        description: "The role has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setDeletingRole(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const items = query.data?.data.items ?? [];
  const total = query.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const columns: DataTableColumn<Role>[] = [
    { key: "name", header: "Name" },
    {
      key: "permissions",
      header: "Permissions",
      render: (row) => {
        const keys = Object.keys(row.permissions ?? {});
        return keys.length > 0 ? `${keys.length} permission key(s)` : "No permissions set";
      },
    },
    {
      key: "adminUsers",
      header: "Admin Users",
      render: (row) => row._count?.adminUsers ?? 0,
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
          <IconButton
            aria-label={`Edit ${row.name}`}
            icon={<Pencil size={16} />}
            onClick={() => {
              setEditingRole(row);
              setFormOpen(true);
            }}
          />
          <IconButton
            aria-label={`Delete ${row.name}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingRole(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setEditingRole(null);
            setFormOpen(true);
          }}
        >
          Add Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No roles found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <RoleFormModal open={formOpen} onClose={() => setFormOpen(false)} role={editingRole} />

      <Modal
        open={Boolean(deletingRole)}
        onClose={() => setDeletingRole(null)}
        title="Delete Role"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingRole(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingRole && deleteMutation.mutate(deletingRole.id)}
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
            <ShieldAlert size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete <strong>{deletingRole?.name}</strong>? This action
            cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function AdminUsersTab() {
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => listAdminUsers({ page, limit: PAGE_LIMIT }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      toast({
        title: "Admin user deleted",
        description: "The admin user has been removed successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeletingUser(null);
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast({ title: "Delete failed", description: message, variant: "error" });
    },
  });

  const items = query.data?.data.items ?? [];
  const total = query.data?.data.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const columns: DataTableColumn<AdminUser>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role", render: (row) => row.role?.name || "—" },
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
          <IconButton
            aria-label={`Edit ${row.name}`}
            icon={<Pencil size={16} />}
            onClick={() => {
              setEditingUser(row);
              setFormOpen(true);
            }}
          />
          <IconButton
            aria-label={`Delete ${row.name}`}
            icon={<Trash2 size={16} />}
            onClick={() => setDeletingUser(row)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setEditingUser(null);
            setFormOpen(true);
          }}
        >
          Add Admin User
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No admin users found"
      />

      {!query.isLoading && !query.isError && total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <AdminUserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        adminUser={editingUser}
      />

      <Modal
        open={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        title="Delete Admin User"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setDeletingUser(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
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
            <UserX size={20} style={{ color: "#dc2626" }} />
          </div>
          <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
            Are you sure you want to delete <strong>{deletingUser?.name}</strong>? This action
            cannot be undone.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default function RolesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Role & Permission Management"
        description="Manage roles, permissions, and assign roles to admin users."
      />

      <Tabs
        tabs={[
          { key: "roles", label: "Roles", content: <RolesTab /> },
          { key: "admin-users", label: "Admin Users", content: <AdminUsersTab /> },
        ]}
      />
    </div>
  );
}
