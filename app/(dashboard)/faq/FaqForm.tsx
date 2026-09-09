"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import { createFaq, updateFaq } from "@/services/faqs";
import { Faq } from "@/types";

export interface FaqFormProps {
  faq?: Faq | null;
}

interface FormState {
  question: string;
  answer: string;
}

const emptyForm: FormState = { question: "", answer: "" };

export default function FaqForm({ faq }: FaqFormProps) {
  const isEdit = Boolean(faq);
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setForm(faq ? { question: faq.question, answer: faq.answer } : emptyForm);
  }, [faq]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
      };
      if (isEdit && faq) {
        return updateFaq(faq.id, payload);
      }
      return createFaq(payload);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "FAQ updated" : "FAQ created",
        description: isEdit
          ? "FAQ has been updated successfully."
          : "New FAQ has been added successfully.",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      router.push("/faq");
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
    if (!form.question.trim()) nextErrors.question = "Question is required";
    if (!form.answer.trim()) nextErrors.answer = "Answer is required";
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
        title={isEdit ? "Edit FAQ" : "Add FAQ"}
        description={isEdit ? "Update this frequently asked question." : "Create a new FAQ entry."}
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Question"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            error={errors.question}
            placeholder="How do I track my order?"
            required
          />
          <Textarea
            label="Answer"
            value={form.answer}
            onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
            error={errors.answer}
            placeholder="You can track your order from..."
            rows={6}
            required
          />
          <div className="flex items-center gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/faq")}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {isEdit ? "Save Changes" : "Create FAQ"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
