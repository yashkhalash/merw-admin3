"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import Card from "./Card";
import { useCountUp } from "./useCountUp";
import { formatNumber } from "@/lib/utils";

export interface KPICardProps {
  label: string;
  value: number;
  trend?: number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  formatter?: (n: number) => string;
}

export default function KPICard({ label, value, trend = 0, icon: Icon, prefix = "", suffix = "", formatter }: KPICardProps) {
  const animated = useCountUp(value);
  const isUp = trend >= 0;
  const display = formatter ? formatter(animated) : formatNumber(animated);

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {label}
        </span>
        <div
          className="flex items-center justify-center h-9 w-9 rounded-lg"
          style={{ background: "color-mix(in srgb, var(--color-primary) 15%, transparent)" }}
        >
          <Icon size={18} style={{ color: "var(--color-primary)" }} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold" style={{ color: "var(--color-foreground)" }}>
          {prefix}
          {display}
          {suffix}
        </span>
        <span
          className="flex items-center gap-0.5 text-xs font-medium rounded-full px-1.5 py-0.5"
          style={{
            color: isUp ? "#16a34a" : "#dc2626",
            background: isUp ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
          }}
        >
          {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </span>
      </div>
    </Card>
  );
}
