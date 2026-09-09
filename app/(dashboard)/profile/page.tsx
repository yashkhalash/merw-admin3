"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ShieldCheck, KeyRound, LogOut, BadgeCheck, Pencil } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import LogoUpload from "@/components/ui/LogoUpload";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { useSiteConfig } from "@/providers/SiteConfigProvider";
import * as authService from "@/services/auth";
import { cn } from "@/lib/utils";

function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [saving, setSaving] = useState(false);

  // Re-seed the form from the latest user whenever the modal is (re)opened.
  const [openedWith, setOpenedWith] = useState(false);
  if (open && !openedWith) {
    setOpenedWith(true);
    setName(user?.name || "");
    setEmail(user?.email || "");
    setAvatarUrl(user?.avatarUrl ?? null);
  } else if (!open && openedWith) {
    setOpenedWith(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await authService.updateProfile({ name, email, avatarUrl });
      await refreshUser();
      toast({ title: "Profile updated", description: "Your profile has been updated.", variant: "success" });
      onClose();
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Couldn't update your profile. Please try again.";
      toast({ title: "Update failed", description: message, variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit profile"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <LogoUpload
          value={avatarUrl}
          onChange={setAvatarUrl}
          shape="circle"
          size={72}
          label=""
          uploadLabel="Upload photo"
          hint="PNG or JPG, up to 2MB."
        />
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
    </Modal>
  );
}

function OverviewTab({ onEditProfile }: { onEditProfile: () => void }) {
  const { user } = useAuth();
  const { logoUrl, updateSiteConfig } = useSiteConfig();
  const { toast } = useToast();
  const [logo, setLogo] = useState(logoUrl);
  const [saving, setSaving] = useState(false);

  const infoRows = [
    { label: "Full name", value: user?.name || "Admin User", capitalize: false },
    { label: "Email address", value: user?.email || "admin@merw.com", capitalize: false },
    { label: "Role", value: user?.role || "admin", capitalize: true },
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
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
            Account details
          </p>
          <Button variant="outline" size="sm" leftIcon={<Pencil size={13} />} onClick={onEditProfile}>
            Edit profile
          </Button>
        </div>
        {infoRows.map((row, i) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--color-border)" }}
          >
            <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
            <span
              className={cn("text-sm font-medium", row.capitalize && "capitalize")}
              style={{ color: "var(--color-foreground)" }}
            >
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
  const [editOpen, setEditOpen] = useState(false);

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

        <div className="absolute -bottom-14 left-6 flex items-center gap-4">
          <div className="relative" style={{ boxShadow: "0 0 0 4px var(--color-surface)", borderRadius: "9999px" }}>
            <Avatar name={user?.name || "Admin User"} src={user?.avatarUrl} size={84} />
            <button
              aria-label="Edit profile photo"
              onClick={() => setEditOpen(true)}
              className="absolute bottom-0 right-0 flex items-center justify-center h-7 w-7 rounded-full transition-transform duration-150 hover:scale-105"
              style={{
                background: "var(--color-primary)",
                color: "var(--color-surface)",
                border: "2px solid var(--color-surface)",
              }}
            >
              <Pencil size={12} />
            </button>
          </div>
          <div className="mt-4">
            <p className="text-base font-semibold" style={{ color: "var(--color-foreground)" }}>
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: "var(--color-text-muted)" }}>
              <Mail size={12} /> {user?.email || "admin@merw.com"}
            </p>
          </div>
        </div>
      </div>

      <Tabs
        tabs={[
          { key: "overview", label: "Overview", content: <OverviewTab onEditProfile={() => setEditOpen(true)} /> },
          { key: "security", label: "Security", content: <SecurityTab /> },
        ]}
      />

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

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
