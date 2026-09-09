"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/apiClient";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen" style={{ background: "var(--color-background)" }}>
      <div
        className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}
        aria-label="Loading"
      />
    </div>
  );
}
