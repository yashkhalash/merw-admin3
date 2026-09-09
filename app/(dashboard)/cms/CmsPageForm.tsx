"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import WysiwygEditor from "@/components/ui/WysiwygEditor";
import { useToast } from "@/providers/ToastProvider";
import { createCmsPage, updateCmsPage } from "@/services/cms";
import { CmsPage } from "@/types";

export interface CmsPageFormProps {
  page?: CmsPage | null;
}

interface FormState {
  slug: string;
  title: string;
  content: string;
}

const emptyForm: FormState = { slug: "", title: "", content: "" };

export default function CmsPageForm({ page }: CmsPageFormProps) {
  const isEdit = Boolean(page);
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setForm(page ? { slug: page.slug, title: page.title, content: page.content } : emptyForm);
  }, [page]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        content: form.content,
      };
      if (isEdit && page) {
        return updateCmsPage(page.id, payload);
      }
      return createCmsPage(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Page updated" : "Page created",
        description: isEdit
          ? "CMS page has been updated successfully."
          : "New CMS page has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["cms-pages"] });
      router.push("/cms");
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
    if (!form.slug.trim()) nextErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(form.slug.trim()))
      nextErrors.slug = "Use lowercase letters, numbers and hyphens only";
    if (!form.title.trim()) nextErrors.title = "Title is required";
    if (!form.content.trim() || form.content === "<br>")
      nextErrors.content = "Content is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={isEdit ? "Edit Page" : "Add Page"}
        description={
          isEdit ? "Update this CMS page's content." : "Create a new static content page."
        }
      />

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              error={errors.slug}
              placeholder="about-us"
              required
            />
            <Input
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              error={errors.title}
              placeholder="About Us"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
              Content
            </label>
            <WysiwygEditor
              value={form.content}
              onChange={(html) => setForm((f) => ({ ...f, content: html }))}
              placeholder="Write the page content..."
            />
            {errors.content && <p className="text-xs text-red-500">{errors.content}</p>}
          </div>
          <div className="flex items-center gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/cms")}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? "Save Changes" : "Create Page"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
