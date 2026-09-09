"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}

const GAP = 8;

export default function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const position = () => {
    const el = wrapperRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let top = 0;
    let left = 0;
    switch (side) {
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + GAP;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - GAP;
        break;
      case "bottom":
        top = rect.bottom + GAP;
        left = rect.left + rect.width / 2;
        break;
      default:
        top = rect.top - GAP;
        left = rect.left + rect.width / 2;
    }
    setCoords({ top, left });
  };

  const open = () => {
    timerRef.current = setTimeout(() => {
      position();
      setShow(true);
    }, 150);
  };
  const close = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShow(false);
  };

  const transformBySide: Record<string, string> = {
    top: "translate(-50%, -100%)",
    bottom: "translate(-50%, 0)",
    right: "translate(0, -50%)",
    left: "translate(-100%, -50%)",
  };

  return (
    <span
      ref={wrapperRef}
      className="relative inline-flex"
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      {children}
      {show &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            role="tooltip"
            className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium text-white shadow-lg animate-fade-in"
            style={{
              top: coords.top,
              left: coords.left,
              transform: transformBySide[side],
              background: "#1e293b",
            }}
          >
            {content}
          </span>,
          document.body
        )}
    </span>
  );
}
