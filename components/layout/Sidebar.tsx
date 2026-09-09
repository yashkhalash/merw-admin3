"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navGroups } from "@/lib/navConfig";
import Logo from "../ui/Logo";
import Tooltip from "../ui/Tooltip";
import Avatar from "../ui/Avatar";
import Badge from "../ui/Badge";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebarPreference } from "@/providers/SidebarPreferenceProvider";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { defaultCollapsed, compact, hoverExpand } = useSidebarPreference();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [hovering, setHovering] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  // While collapsed with "expand on hover" enabled, hovering the sidebar peeks it
  // open. The peeked width is pushed into --sidebar-width too, so every page's
  // content reflows to stay fully visible instead of being covered by the flyout.
  const peeking = collapsed && hoverExpand && hovering;
  const effectiveCollapsed = collapsed && !peeking;

  useEffect(() => {
    const width = effectiveCollapsed ? "72px" : "272px";
    document.documentElement.style.setProperty("--sidebar-width", width);
  }, [effectiveCollapsed]);

  const renderContent = (isCollapsed: boolean, isDesktop: boolean) => (
    <div
      className="flex h-full flex-col shadow-[1px_0_3px_rgba(0,0,0,0.04)]"
      style={{ background: "var(--color-surface)" }}
    >
      <div
        className={cn(
          "flex px-4 py-4",
          // Collapsed = only 72px wide (40px after padding) — logo + toggle button
          // can't share one row without overlapping/squishing, so stack them instead.
          isCollapsed ? "flex-col items-center gap-2" : "items-center justify-between"
        )}
      >
        <Logo collapsed={isCollapsed} />
        {isDesktop && (
          <Tooltip content={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} side="right">
            <button
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed((c) => !c)}
              className="flex items-center justify-center rounded-md p-1.5 hover:bg-black/5 transition-colors duration-150"
            >
              {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          </Tooltip>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar px-2 py-2 space-y-5">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && !isCollapsed && (
              <p
                className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-text-muted)" }}
              >
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                const Icon = item.icon;
                const linkEl = (
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      "relative flex items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200",
                      compact ? "py-1.5" : "py-2",
                      isCollapsed && "justify-center"
                    )}
                    style={{
                      color: isActive ? "var(--color-primary)" : "var(--color-foreground)",
                      background: isActive
                        ? "color-mix(in srgb, var(--color-primary) 12%, transparent)"
                        : "transparent",
                    }}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full transition-all duration-200"
                        style={{ background: "var(--color-primary)" }}
                      />
                    )}
                    <Icon size={20} className="shrink-0" />
                    {!isCollapsed && <span className="truncate flex-1">{item.label}</span>}
                    {item.badge && isCollapsed && (
                      <span
                        className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
                        style={{ background: "var(--color-primary)" }}
                      />
                    )}
                    {item.badge && !isCollapsed && <Badge variant="primary">{item.badge}</Badge>}
                  </Link>
                );
                return (
                  <li key={item.href}>
                    {isCollapsed ? (
                      <Tooltip content={item.label} side="right">
                        {linkEl}
                      </Tooltip>
                    ) : (
                      linkEl
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3">
        {isCollapsed ? (
          <Tooltip content={user?.name || "Admin User"} side="right">
            <div className="flex items-center justify-center">
              <Avatar name={user?.name || "Admin User"} src={user?.avatarUrl} size={36} />
            </div>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5">
            <Avatar name={user?.name || "Admin User"} src={user?.avatarUrl} size={36} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || "Admin User"}</p>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                {user?.role || "admin"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-30 transition-all duration-200",
          peeking && "shadow-2xl"
        )}
        style={{ width: peeking ? "272px" : "var(--sidebar-width)" }}
        onMouseEnter={() => hoverExpand && collapsed && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {renderContent(effectiveCollapsed, true)}
      </aside>

      {/* Mobile overlay: always shown expanded, regardless of the desktop collapse preference */}
      <div className={cn("md:hidden fixed inset-0 z-40", !mobileOpen && "pointer-events-none")}>
        <div
          className="absolute inset-0 bg-black/40 transition-opacity duration-200"
          style={{ opacity: mobileOpen ? 1 : 0 }}
          onClick={onMobileClose}
        />
        <aside
          className="absolute inset-y-0 left-0 w-[272px] shadow-xl transition-transform duration-200"
          style={{ transform: mobileOpen ? "translateX(0)" : "translateX(-100%)" }}
        >
          {renderContent(false, false)}
        </aside>
      </div>
    </>
  );
}
