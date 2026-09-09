"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AxiosError } from "axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useToast } from "@/providers/ToastProvider";
import * as authService from "@/services/auth";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast({ title: "Reset link sent", description: "Check your inbox for instructions.", variant: "success" });
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Could not send reset link.";
      toast({ title: "Request failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Forgot password</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@merw.com"
        required
      />
      <Button type="submit" loading={loading} className="w-full mt-1">
        {sent ? "Resend link" : "Send reset link"}
      </Button>
      <Link href="/login" className="text-center text-xs hover:underline" style={{ color: "var(--color-primary)" }}>
        Back to sign in
      </Link>
    </form>
  );
}
