import {
  LayoutDashboard,
  UserCircle,
  Users,
  Store,
  Truck,
  ShieldCheck,
  ShoppingCart,
  Wallet,
  Settings2,
  Bell,
  KeyRound,
  FileText,
  HelpCircle,
  Flag,
  Mail,
  LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
}

export interface NavGroup {
  label: string | null; // null = ungrouped / top-level
  items: NavItem[];
}

// All 15 SOW modules represented as nav placeholders — only Dashboard + Auth
// have real screens built in this pass. Links intentionally point to routes
// that will be filled in module by module.
export const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Marketplace",
    items: [
      { label: "Customer Management", href: "/customers", icon: Users },
      { label: "Seller Management", href: "/sellers", icon: Store },
      { label: "Courier Management", href: "/couriers", icon: Truck },
      { label: "Order Management", href: "/orders", icon: ShoppingCart },
      { label: "Product Moderation", href: "/product-moderation", icon: ShieldCheck, badge: 3 },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "Financial & Commission", href: "/financial", icon: Wallet },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Platform Configuration", href: "/platform-config", icon: Settings2 },
      { label: "Notification Management", href: "/notifications", icon: Bell },
      { label: "Role & Permission Mgmt", href: "/roles", icon: KeyRound },
    ],
  },
  {
    label: "Content",
    items: [
      { label: "CMS Management", href: "/cms", icon: FileText },
      { label: "FAQ Management", href: "/faq", icon: HelpCircle },
      { label: "Content Moderation", href: "/content-moderation", icon: Flag, badge: 5 },
      { label: "Contact Enquiries", href: "/enquiries", icon: Mail },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/settings", icon: Settings2 },
      { label: "My Profile", href: "/profile", icon: UserCircle },
    ],
  },
];
