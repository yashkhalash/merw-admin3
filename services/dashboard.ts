import { request } from "@/lib/apiClient";
import { ApiEnvelope, DashboardAnalytics, DashboardSummary } from "@/types";

export async function getSummary() {
  return request<ApiEnvelope<DashboardSummary>>("dashboard/summary", {
    method: "get",
  });
}

export async function getAnalytics() {
  return request<ApiEnvelope<DashboardAnalytics>>("dashboard/analytics", {
    method: "get",
  });
}

export const mockSummary: DashboardSummary = {
  totalOrders: 18240,
  totalRevenue: 942310,
  activeSellers: 312,
  activeCouriers: 87,
  newCustomers: 540,
  pendingSellerApprovals: 14,
};

export const mockAnalytics: DashboardAnalytics = {
  gmvOverTime: [
    { month: "Jan", gmv: 40000 },
    { month: "Feb", gmv: 48500 },
    { month: "Mar", gmv: 60000 },
    { month: "Apr", gmv: 65000 },
    { month: "May", gmv: 78000 },
    { month: "Jun", gmv: 82000 },
    { month: "Jul", gmv: 94000 },
  ],
  ordersOverTime: [
    { month: "Jan", orders: 1200 },
    { month: "Feb", orders: 1420 },
    { month: "Mar", orders: 1640 },
    { month: "Apr", orders: 1860 },
    { month: "May", orders: 2080 },
    { month: "Jun", orders: 2300 },
    { month: "Jul", orders: 2520 },
  ],
  topCategories: [
    { name: "Electronics", value: 34 },
    { name: "Fashion", value: 26 },
    { name: "Home", value: 18 },
    { name: "Grocery", value: 14 },
    { name: "Other", value: 8 },
  ],
  topSellers: [
    { name: "Nova Traders", revenue: 82000 },
    { name: "Urban Basket", revenue: 71000 },
    { name: "GreenLeaf", revenue: 65500 },
    { name: "PixelMart", revenue: 58900 },
    { name: "Swift Goods", revenue: 51200 },
  ],
  recentActivity: [
    { id: 1, text: "Seller 'Nova Traders' approved", time: "2m ago" },
    { id: 2, text: "New order #48213 placed", time: "10m ago" },
    { id: 3, text: "Courier onboarding completed", time: "1h ago" },
    { id: 4, text: "Product flagged for review", time: "3h ago" },
  ],
};
