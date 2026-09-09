"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X } from "lucide-react";

export interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
}

export default function FileUpload({ label, accept, multiple, onFilesSelected }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list);
    setFiles(arr);
    onFilesSelected?.(arr);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>{label}</label>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        role="button"
        tabIndex={0}
        className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors duration-150"
        style={{
          borderColor: dragOver ? "var(--color-primary)" : "var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <UploadCloud size={24} style={{ color: "var(--color-primary)" }} />
        <p className="text-sm" style={{ color: "var(--color-foreground)" }}>
          Drag & drop files here, or click to browse
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="flex flex-col gap-1 mt-1">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-xs rounded px-2 py-1"
              style={{ background: "var(--color-background)", color: "var(--color-foreground)" }}
            >
              <FileIcon size={14} />
              <span className="flex-1 truncate">{f.name}</span>
              <button
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
              >
                <X size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
