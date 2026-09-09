"use client";

import React, { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

const MAX_BYTES = 2 * 1024 * 1024; // 2MB — keeps the base64 payload comfortably under the API body limit.

export interface LogoUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  size?: number;
  label?: string;
  hint?: string;
}

export default function LogoUpload({
  value,
  onChange,
  size = 64,
  label = "Site logo",
  hint = "PNG, JPG or SVG, up to 2MB.",
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image is too large — please pick one under 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.onerror = () => setError("Couldn't read that file — please try again.");
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
          {label}
        </p>
      )}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-xl overflow-hidden shrink-0"
          style={{
            width: size,
            height: size,
            background: "var(--color-background)",
            border: "1px solid var(--color-border)",
          }}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Logo preview" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={20} style={{ color: "var(--color-text-muted)" }} />
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs font-medium rounded-md px-3 py-1.5 transition-colors duration-150 hover:bg-black/5"
              style={{ border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
            >
              Upload logo
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove logo"
                className="flex items-center justify-center h-7 w-7 rounded-md transition-colors duration-150 hover:bg-black/5"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {error || hint}
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
