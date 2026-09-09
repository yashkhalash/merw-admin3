"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Check, X as XIcon, Pencil, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import IconButton from "@/components/ui/IconButton";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import Tabs from "@/components/ui/Tabs";
import { useToast } from "@/providers/ToastProvider";
import { formatCurrency } from "@/lib/utils";
import { Category, Product, ProductModerationStatus } from "@/types";
import {
  CategoryInput,
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "@/services/categories";
import {
  ProductInput,
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
  updateProductModeration,
} from "@/services/products";
import ProductFormModal from "./ProductFormModal";
import CategoryFormModal from "./CategoryFormModal";

const PAGE_SIZE = 10;

const moderationStatusOptions = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const statusBadgeVariant: Record<ProductModerationStatus, BadgeVariant> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function ProductsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [moderationStatus, setModerationStatus] = useState<ProductModerationStatus | "">("");
  const debouncedSearch = useDebouncedValue(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["categories", "all-for-select"],
    queryFn: () => listCategories({ page: 1, limit: 100 }),
  });
  const categories: Category[] = categoriesQuery.data?.data.items ?? [];

  const queryKey = useMemo(
    () => ["products", { page, search: debouncedSearch, moderationStatus }],
    [page, debouncedSearch, moderationStatus]
  );

  const productsQuery = useQuery({
    queryKey,
    queryFn: () => listProducts({ page, limit: PAGE_SIZE, search: debouncedSearch, moderationStatus }),
  });

  const data = productsQuery.data?.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function invalidateProducts() {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }

  const createMutation = useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      toast({ title: "Product created", variant: "success" });
      setModalOpen(false);
      invalidateProducts();
    },
    onError: (err: any) => {
      toast({ title: "Failed to create product", description: err?.response?.data?.message, variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: ProductInput }) => updateProduct(id, input),
    onSuccess: () => {
      toast({ title: "Product updated", variant: "success" });
      setModalOpen(false);
      setEditingProduct(null);
      invalidateProducts();
    },
    onError: (err: any) => {
      toast({ title: "Failed to update product", description: err?.response?.data?.message, variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      toast({ title: "Product deleted", variant: "success" });
      invalidateProducts();
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete product", description: err?.response?.data?.message, variant: "error" });
    },
  });

  const moderationMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ProductModerationStatus }) =>
      updateProductModeration(id, status),
    onSuccess: (_res, variables) => {
      toast({
        title: variables.status === "APPROVED" ? "Product approved" : "Product rejected",
        variant: "success",
      });
      invalidateProducts();
    },
    onError: (err: any) => {
      toast({ title: "Failed to update moderation status", description: err?.response?.data?.message, variant: "error" });
    },
  });

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  function handleFormSubmit(input: ProductInput) {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleDelete(product: Product) {
    if (window.confirm(`Delete product "${product.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(product.id);
    }
  }

  const columns: DataTableColumn<Product>[] = [
    { key: "name", header: "Name" },
    { key: "category", header: "Category", render: (row) => row.category?.name ?? "—" },
    { key: "seller", header: "Seller", render: (row) => row.seller?.businessName ?? "—" },
    { key: "price", header: "Price", render: (row) => formatCurrency(row.price) },
    { key: "stock", header: "Stock", render: (row) => String(row.stock) },
    {
      key: "moderationStatus",
      header: "Status",
      render: (row) => <Badge variant={statusBadgeVariant[row.moderationStatus]}>{row.moderationStatus}</Badge>,
    },
    {
      key: "createdAt",
      header: "Created",
      render: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.moderationStatus === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Check size={14} />}
                onClick={() => moderationMutation.mutate({ id: row.id, status: "APPROVED" })}
                loading={moderationMutation.isPending && moderationMutation.variables?.id === row.id && moderationMutation.variables?.status === "APPROVED"}
              >
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                leftIcon={<XIcon size={14} />}
                onClick={() => moderationMutation.mutate({ id: row.id, status: "REJECTED" })}
                loading={moderationMutation.isPending && moderationMutation.variables?.id === row.id && moderationMutation.variables?.status === "REJECTED"}
              >
                Reject
              </Button>
            </>
          )}
          <IconButton aria-label="Edit product" icon={<Pencil size={16} />} onClick={() => openEditModal(row)} />
          <IconButton aria-label="Delete product" icon={<Trash2 size={16} />} onClick={() => handleDelete(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Products"
        description="Review and moderate products listed by sellers."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
            Add Product
          </Button>
        }
      />

      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-72">
          <Input
            label="Search"
            placeholder="Search by product name"
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            label="Status"
            options={moderationStatusOptions}
            value={moderationStatus}
            onChange={(e) => {
              setModerationStatus(e.target.value as ProductModerationStatus | "");
              setPage(1);
            }}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={productsQuery.isLoading}
        error={productsQuery.isError}
        onRetry={() => productsQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No products found"
      />

      {data && data.total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        categories={categories}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

function CategoriesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const queryKey = useMemo(() => ["categories", { page, search: debouncedSearch }], [page, debouncedSearch]);

  const categoriesQuery = useQuery({
    queryKey,
    queryFn: () => listCategories({ page, limit: PAGE_SIZE, search: debouncedSearch }),
  });

  const data = categoriesQuery.data?.data;
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  function invalidateCategories() {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  }

  const createMutation = useMutation({
    mutationFn: (input: CategoryInput) => createCategory(input),
    onSuccess: () => {
      toast({ title: "Category created", variant: "success" });
      setModalOpen(false);
      invalidateCategories();
    },
    onError: (err: any) => {
      toast({ title: "Failed to create category", description: err?.response?.data?.message, variant: "error" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: CategoryInput }) => updateCategory(id, input),
    onSuccess: () => {
      toast({ title: "Category updated", variant: "success" });
      setModalOpen(false);
      setEditingCategory(null);
      invalidateCategories();
    },
    onError: (err: any) => {
      toast({ title: "Failed to update category", description: err?.response?.data?.message, variant: "error" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      toast({ title: "Category deleted", variant: "success" });
      invalidateCategories();
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete category", description: err?.response?.data?.message, variant: "error" });
    },
  });

  function openCreateModal() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  function handleFormSubmit(input: CategoryInput) {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, input });
    } else {
      createMutation.mutate(input);
    }
  }

  function handleDelete(category: Category) {
    if (window.confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(category.id);
    }
  }

  const columns: DataTableColumn<Category>[] = [
    { key: "name", header: "Name" },
    { key: "description", header: "Description", render: (row) => row.description || "—" },
    { key: "products", header: "Products", render: (row) => String(row._count?.products ?? 0) },
    { key: "createdAt", header: "Created", render: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex items-center gap-1">
          <IconButton aria-label="Edit category" icon={<Pencil size={16} />} onClick={() => openEditModal(row)} />
          <IconButton aria-label="Delete category" icon={<Trash2 size={16} />} onClick={() => handleDelete(row)} />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Manage the product categories used across the marketplace."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={openCreateModal}>
            Add Category
          </Button>
        }
      />

      <div className="w-full sm:w-72">
        <Input
          label="Search"
          placeholder="Search by category name"
          leftIcon={<Search size={16} />}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.items ?? []}
        loading={categoriesQuery.isLoading}
        error={categoriesQuery.isError}
        onRetry={() => categoriesQuery.refetch()}
        rowKey={(row) => row.id}
        emptyMessage="No categories found"
      />

      {data && data.total > 0 && (
        <div className="flex justify-end">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        submitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}

export default function ProductModerationPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Product Moderation"
        description="Moderate seller-listed products and manage product categories."
      />
      <Tabs
        tabs={[
          { key: "products", label: "Products", content: <ProductsTab /> },
          { key: "categories", label: "Categories", content: <CategoriesTab /> },
        ]}
      />
    </div>
  );
}
