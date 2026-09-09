"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Sun, Moon, Bell, Settings, Menu, LogOut, User as UserIcon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { useAuth } from "@/providers/AuthProvider";
import Avatar from "../ui/Avatar";
import IconButton from "../ui/IconButton";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const MOCK_RESULTS = [
  "Order #48213",
  "Seller: Nova Traders",
  "Customer: Priya Sharma",
  "Courier: Swift Logistics",
  "FAQ: Refund policy",
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "New seller application received", time: "5m ago" },
  { id: 2, text: "Payout batch #221 completed", time: "1h ago" },
  { id: 3, text: "3 products flagged for review", time: "2h ago" },
];

function useOutsideClick(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}

export default function Navbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const { mode, toggleMode } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const searchRef = useOutsideClick(() => setSearchOpen(false));
  const notifRef = useOutsideClick(() => setNotifOpen(false));
  const profileRef = useOutsideClick(() => setProfileOpen(false));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = query
    ? MOCK_RESULTS.filter((r) => r.toLowerCase().includes(query.toLowerCase()))
    : MOCK_RESULTS;

  return (
    <header
      className="sticky top-0 z-20 flex h-16 items-center gap-3 px-4 md:px-6 shadow-sm transition-all duration-200"
      style={{ background: "var(--color-surface)" }}
    >
      <button
        aria-label="Open menu"
        onClick={onMobileMenu}
        className="md:hidden rounded-md p-2 hover:bg-black/5"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5 md:gap-2">
        {/* Global search */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => setSearchOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm w-40 sm:w-64 text-left"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
            aria-label="Open global search"
          >
            <Search size={16} />
            <span className="flex-1 truncate">Search...</span>
            <kbd
              className="hidden sm:inline text-[10px] rounded px-1 py-0.5"
              style={{ background: "var(--color-background)", color: "var(--color-text-muted)" }}
            >
              ⌘K
            </kbd>
          </button>
          {searchOpen && (
            <div
              className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border shadow-lg z-30 animate-fade-in"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="p-2 border-b" style={{ borderColor: "var(--color-border)" }}>
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search orders, sellers, customers..."
                  className="w-full text-sm px-2 py-1.5 outline-none bg-transparent"
                />
              </div>
              <ul className="max-h-64 overflow-y-auto no-scrollbar py-1">
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    No results found.
                  </li>
                )}
                {filtered.map((r) => (
                  <li key={r}>
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                    >
                      {r}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <IconButton
          aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          icon={mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          onClick={toggleMode}
        />

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <IconButton
            aria-label="Notifications"
            icon={
              <span className="relative inline-flex">
                <Bell size={18} />
                {MOCK_NOTIFICATIONS.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 min-w-4 px-0.5 rounded-full text-[10px] font-semibold leading-none text-white"
                    style={{ background: "#dc2626", border: "1.5px solid var(--color-surface)" }}
                  >
                    {MOCK_NOTIFICATIONS.length > 9 ? "9+" : MOCK_NOTIFICATIONS.length}
                  </span>
                )}
              </span>
            }
            onClick={() => setNotifOpen((o) => !o)}
          />
          {notifOpen && (
            <div
              className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border shadow-lg z-30 animate-fade-in"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="px-3 py-2 border-b text-sm font-medium" style={{ borderColor: "var(--color-border)" }}>
                Notifications
              </div>
              <ul className="max-h-72 overflow-y-auto no-scrollbar">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="px-3 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: "var(--color-border)" }}>
                    <p>{n.text}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                      {n.time}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Settings */}
        <IconButton
          aria-label="Open settings"
          icon={<Settings size={18} />}
          onClick={() => router.push("/settings")}
        />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((o) => !o)} aria-label="Open profile menu">
            <Avatar name={user?.name || "Admin User"} src={user?.avatarUrl} size={32} />
          </button>
          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg border shadow-lg z-30 animate-fade-in overflow-hidden"
              style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
            >
              <div className="px-3 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-sm font-medium truncate">{user?.name || "Admin User"}</p>
                <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                  {user?.email || "admin@merw.com"}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5"
              >
                <UserIcon size={15} /> My Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-black/5"
              >
                <Settings size={15} /> Settings
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  setLogoutOpen(true);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-left text-red-600 hover:bg-black/5"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>

      </div>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Log out"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setLogoutOpen(false);
                logout();
              }}
            >
              Log out
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Are you sure you want to log out? You&apos;ll need to sign in again to access the admin panel.
        </p>
      </Modal>
    </header>
  );
}
