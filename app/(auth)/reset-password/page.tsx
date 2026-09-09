"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import * as authService from "@/services/auth";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "error" });
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast({ title: "Password reset", description: "You can now sign in with your new password.", variant: "success" });
      router.replace("/login");
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not reset password.";
      toast({ title: "Reset failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Reset password</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Choose a new password for your account.
        </p>
      </div>
      <Input
        label="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="••••••••"
        required
      />
      <Button type="submit" loading={loading} className="w-full mt-1">
        Reset password
      </Button>
      <Link href="/login" className="text-center text-xs hover:underline" style={{ color: "var(--color-primary)" }}>
        Back to sign in
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
