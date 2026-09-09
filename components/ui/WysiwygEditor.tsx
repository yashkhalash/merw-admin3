"use client";

import React, { useCallback, useRef } from "react";
import { Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import IconButton from "./IconButton";

export interface WysiwygEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

/** Lightweight contentEditable-based rich text editor — no heavy external dependency. */
export default function WysiwygEditor({ value, onChange, placeholder = "Write something..." }: WysiwygEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  const exec = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const buttons: { icon: React.ElementType; command: string; label: string; arg?: string }[] = [
    { icon: Bold, command: "bold", label: "Bold" },
    { icon: Italic, command: "italic", label: "Italic" },
    { icon: Underline, command: "underline", label: "Underline" },
    { icon: List, command: "insertUnorderedList", label: "Bullet list" },
    { icon: ListOrdered, command: "insertOrderedList", label: "Numbered list" },
    { icon: LinkIcon, command: "createLink", label: "Insert link", arg: "https://" },
  ];

  return (
    <div className="rounded-md overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
      <div className="flex items-center gap-1 px-2 py-1.5" style={{ background: "var(--color-background)", borderBottom: "1px solid var(--color-border)" }}>
        {buttons.map((b) => (
          <IconButton
            key={b.command}
            aria-label={b.label}
            size={16}
            icon={<b.icon size={16} />}
            onClick={() => exec(b.command, b.arg)}
          />
        ))}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label={placeholder}
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[140px] px-3 py-2 text-sm outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:opacity-50"
        style={{ color: "var(--color-foreground)", background: "var(--color-surface)" }}
      />
    </div>
  );
}
