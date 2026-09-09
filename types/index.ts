export type UserRole = "admin" | string;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type SellerApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Seller {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  approvalStatus: SellerApprovalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
  };
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    products: number;
  };
}

export type ProductModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  moderationStatus: ProductModerationStatus;
  sellerId: string;
  categoryId: string;
  category: { id: string; name: string };
  seller: { id: string; businessName: string };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Courier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  serviceArea?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type ShipmentStatus = "PENDING" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "FAILED";

export interface OrderTransaction {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  reference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderShipment {
  id: string;
  orderId: string;
  courierId: string;
  courier?: { id: string; name: string } | null;
  status: ShipmentStatus;
  trackingNo?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  status: OrderStatus;
  totalAmount: number;
  customerId: string;
  customer?: { id: string; name: string; email: string } | null;
  shipments?: OrderShipment[];
  transactions?: OrderTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalOrders: number;
  totalRevenue: number;
  activeSellers: number;
  activeCouriers: number;
  newCustomers: number;
  pendingSellerApprovals: number;
}

export interface TimePoint {
  month: string;
  gmv?: number;
  orders?: number;
}

export interface CategorySlice {
  name: string;
  value: number;
}

export interface TopSeller {
  name: string;
  revenue: number;
}

export interface ActivityItem {
  id: number | string;
  text: string;
  time: string;
}

export interface DashboardAnalytics {
  gmvOverTime: TimePoint[];
  ordersOverTime: TimePoint[];
  topCategories: CategorySlice[];
  topSellers: TopSeller[];
  recentActivity: ActivityItem[];
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ContactEnquiry {
  id: string;
  name: string;
  email: string;
  subject?: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  _count?: {
    adminUsers: number;
  };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId?: string | null;
  role?: { id: string; name: string } | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Commission {
  id: string;
  rate: number;
  sellerId?: string | null;
  categoryId?: string | null;
  seller?: { id: string; businessName: string } | null;
  category?: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";

export interface Payout {
  id: string;
  sellerId: string;
  seller?: { id: string; businessName: string } | null;
  amount: number;
  status: PayoutStatus;
  createdAt: string;
  updatedAt: string;
}

export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";

export interface Transaction {
  id: string;
  orderId: string;
  order?: { id: string; orderNo: string } | null;
  amount: number;
  status: TransactionStatus;
  reference?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type LoaderStyle =
  | "skeleton"
  | "spinner"
  | "progressbar"
  | "pulse"
  | "dots"
  | "bar-skeleton";
