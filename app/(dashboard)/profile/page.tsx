"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, KeyRound, LogOut, BadgeCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import LogoUpload from "@/components/ui/LogoUpload";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useSiteConfig } from "@/providers/SiteConfigProvider";

function OverviewTab() {
  const { user } = useAuth();
  const { logoUrl, updateSiteConfig } = useSiteConfig();
  const { toast } = useToast();
  const [logo, setLogo] = useState(logoUrl);
  const [saving, setSaving] = useState(false);

  const infoRows = [
    { label: "Full name", value: user?.name || "Admin User" },
    { label: "Email address", value: user?.email || "admin@merw.com" },
    { label: "Role", value: user?.role || "admin" },
  ];

  async function handleSaveLogo() {
    setSaving(true);
    try {
      await updateSiteConfig({ logoUrl: logo });
      toast({ title: "Logo updated", description: "The site logo has been updated.", variant: "success" });
    } catch {
      toast({ title: "Update failed", description: "Couldn't update the logo. Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2 flex flex-col gap-1">
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--color-foreground)" }}>
          Account details
        </p>
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-border)" }}
          >
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
            <span className="text-sm font-medium capitalize" style={{ color: "var(--color-foreground)" }}>
              {row.value}
            </span>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Access</p>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <ShieldCheck size={16} style={{ color: "var(--color-primary)" }} />
          Signed in as <Badge>{user?.role || "admin"}</Badge>
        </div>
        <div className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
          <BadgeCheck size={16} style={{ color: "var(--color-primary)" }} />
          Verified admin account
        </div>
      </Card>

      <Card className="lg:col-span-3 flex flex-col gap-3">
        <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Site branding</p>
        <LogoUpload value={logo} onChange={setLogo} label="" hint="Shown in the sidebar, browser tab and login screen." />
        <Button size="sm" className="self-start" onClick={handleSaveLogo} loading={saving}>
          Save logo
        </Button>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const router = useRouter();
  return (
    <Card className="max-w-lg flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <KeyRound size={18} style={{ color: "var(--color-primary)" }} />
        <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>Password</p>
      </div>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Passwords are changed through the secure reset flow — we&apos;ll email you a link to set a
        new one.
      </p>
      <Button variant="outline" size="sm" className="self-start" onClick={() => router.push("/forgot-password")}>
        Send password reset link
      </Button>
    </Card>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your account details and security." />

      <div className="relative mb-14" style={{ height: 96 }}>
        {/* Gradient banner — clipped to its own layer so it never crops the avatar/name
            that intentionally overflow below it. */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{ background: "linear-gradient(120deg, var(--color-primary), var(--color-secondary))" }}
        />

        <div className="absolute top-3 right-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogoutOpen(true)}
            style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff" }}
            className="hover:bg-white/25"
          >
            <LogOut size={14} /> Sign out
          </Button>
        </div>

        <div className="absolute -bottom-10 left-6 flex items-end gap-4">
          <div style={{ boxShadow: "0 0 0 4px var(--color-surface)", borderRadius: "9999px" }}>
            <Avatar name={user?.name || "Admin User"} size={84} />
          </div>
          <div className="pb-2">
            <p className="text-base font-semibold" style={{ color: "var(--color-foreground)" }}>
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs flex items-center gap-1" style={{ color: "var(--color-text-muted)" }}>
              <Mail size={12} /> {user?.email || "admin@merw.com"}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "overview", label: "Overview", content: <OverviewTab /> },
          { key: "security", label: "Security", content: <SecurityTab /> },
        ]}
      />

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
    </div>
  );
}
