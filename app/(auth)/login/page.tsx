"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useSiteConfig } from "@/providers/SiteConfigProvider";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { toast } = useToast();
  const { siteName } = useSiteConfig();

  const [email, setEmail] = useState("admin@merw.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: "Welcome back", description: "Logged in successfully.", variant: "success" });
      router.replace("/dashboard");
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        "Invalid email or password.";
      toast({ title: "Login failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Sign in to {siteName}</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Manage your marketplace from one place.
        </p>
      </div>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@merw.com"
        required
        autoComplete="email"
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
        autoComplete="current-password"
      />
      <div className="flex justify-end -mt-2">
        <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: "var(--color-primary)" }}>
          Forgot password?
        </Link>
      </div>
      <Button type="submit" loading={loading} className="w-full mt-1">
        Sign in
      </Button>
    </form>
  );
}
