"use client";

import { useEffect } from "react";
import { ServerCrash } from "lucide-react";
import Button from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4" style={{ background: "#f8fafc" }}>
          <div className="flex items-center justify-center h-16 w-16 rounded-full" style={{ background: "rgba(220,38,38,0.12)" }}>
            <ServerCrash size={28} style={{ color: "#dc2626" }} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-800">500 — Something went wrong</h1>
          <p className="text-sm max-w-sm text-slate-500">
            An unexpected error occurred. Please try again.
          </p>
          <Button size="sm" onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
