import React from "react";
import Logo from "@/components/ui/Logo";
import AuthSlider from "@/components/ui/AuthSlider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2" style={{ background: "var(--color-background)" }}>
      <AuthSlider />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:justify-start">
            <Logo size={36} />
          </div>
          <div
            className="rounded-xl border p-6 shadow-sm"
            style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
