"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart,
  DollarSign,
  Store,
  Truck,
  UserPlus,
  ClipboardCheck,
  PlusCircle,
  FileText,
  Users,
  Settings2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import KPICard from "@/components/ui/KPICard";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Button from "@/components/ui/Button";
import { PageError } from "@/components/ui/ErrorState";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/providers/ThemeProvider";
import { getSummary, getAnalytics, mockSummary, mockAnalytics } from "@/services/dashboard";
import { formatCurrency, formatNumber } from "@/lib/utils";

function KpiSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-3">
          <Skeleton height={14} width="50%" />
          <Skeleton height={28} width="70%" />
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { palette, mode } = useTheme();
  const tokens = mode === "dark" ? palette.dark : palette.light;

  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      try {
        return (await getSummary()).data;
      } catch {
        return mockSummary;
      }
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ["dashboard-analytics"],
    queryFn: async () => {
      try {
        return (await getAnalytics()).data;
      } catch {
        return mockAnalytics;
      }
    },
  });

  const loading = summaryQuery.isLoading || analyticsQuery.isLoading;
  const summary = summaryQuery.data;
  const analytics = analyticsQuery.data;

  const kpis = summary
    ? [
        { label: "Total Orders", value: summary.totalOrders, trend: 8.2, icon: ShoppingCart },
        { label: "Total Revenue", value: summary.totalRevenue, trend: 12.4, icon: DollarSign, formatter: formatCurrency },
        { label: "Active Sellers", value: summary.activeSellers, trend: 3.1, icon: Store },
        { label: "Active Couriers", value: summary.activeCouriers, trend: -1.5, icon: Truck },
        { label: "New Customers", value: summary.newCustomers, trend: 5.6, icon: UserPlus },
        { label: "Pending Seller Approvals", value: summary.pendingSellerApprovals, trend: -4.2, icon: ClipboardCheck },
      ]
    : [];

  const pieColors = [tokens.accent1, tokens.accent2, "#94a3b8", "#cbd5e1", "#e2e8f0"];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] || "Admin"} 👋`}
        description="Here's what's happening across your marketplace today."
      />

      {summaryQuery.isError && analyticsQuery.isError ? (
        <PageError onRetry={() => { summaryQuery.refetch(); analyticsQuery.refetch(); }} />
      ) : (
        <>
          {loading ? (
            <KpiSkeletonGrid />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpis.map((kpi) => (
                <KPICard key={kpi.label} {...kpi} />
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>GMV Over Time</h3>
              {loading ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={analytics?.gmvOverTime}>
                    <defs>
                      <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={tokens.accent1} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={tokens.accent1} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="gmv" stroke={tokens.accent1} fill="url(#gmvGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Orders Over Time</h3>
              {loading ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics?.ordersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                    <RechartsTooltip />
                    <Bar dataKey="orders" fill={tokens.accent2} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Top Categories</h3>
              {loading ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={analytics?.topCategories} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                      {analytics?.topCategories.map((_, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Top Sellers</h3>
              {loading ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={analytics?.topSellers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} stroke="var(--color-text-muted)" />
                    <RechartsTooltip />
                    <Bar dataKey="revenue" fill={tokens.accent1} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Recent Activity</h3>
              {loading ? (
                <div className="flex flex-col gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} height={16} />
                  ))}
                </div>
              ) : (
                <ul className="flex flex-col gap-3">
                  {analytics?.recentActivity.map((a) => (
                    <li key={a.id} className="flex items-start justify-between gap-3 text-sm">
                      <span style={{ color: "var(--color-foreground)" }}>{a.text}</span>
                      <span className="shrink-0 text-xs" style={{ color: "var(--color-text-muted)" }}>{a.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--color-foreground)" }}>Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  leftIcon={<PlusCircle size={16} />}
                  className="justify-start"
                  onClick={() => router.push("/product-moderation")}
                >
                  Add New Product
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Users size={16} />}
                  className="justify-start"
                  onClick={() => router.push("/sellers")}
                >
                  Review Seller Applications
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<FileText size={16} />}
                  className="justify-start"
                  onClick={() => router.push("/financial")}
                >
                  View Reports
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Settings2 size={16} />}
                  className="justify-start"
                  onClick={() => router.push("/platform-config")}
                >
                  Platform Settings
                </Button>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
