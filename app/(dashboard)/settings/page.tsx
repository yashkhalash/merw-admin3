"use client";

import React, { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { useTheme } from "@/providers/ThemeProvider";
import { useLoaderPreference } from "@/providers/LoaderPreferenceProvider";
import { useSidebarPreference } from "@/providers/SidebarPreferenceProvider";
import { useToast, ToastPosition } from "@/providers/ToastProvider";
import { useSiteConfig } from "@/providers/SiteConfigProvider";
import { API_BASE_URL, DEFAULT_API_VERSION, DEFAULT_ROLE } from "@/lib/apiConfig";
import { LoaderStyle } from "@/types";
import { RawSkeleton, Spinner, ProgressBar, Dots } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import LogoUpload from "@/components/ui/LogoUpload";

function GeneralTab() {
  const { siteName, supportEmail, logoUrl, updateSiteConfig, loading } = useSiteConfig();
  const { toast } = useToast();

  const [name, setName] = useState(siteName);
  const [email, setEmail] = useState(supportEmail);
  const [logo, setLogo] = useState<string | null>(logoUrl);
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(false);

  // Seed the form from the fetched config exactly once it arrives — after that,
  // the fields are fully user-controlled and shouldn't be clobbered by refetches.
  if (!synced && !loading) {
    setSynced(true);
    setName(siteName);
    setEmail(supportEmail);
    setLogo(logoUrl);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateSiteConfig({ siteName: name, supportEmail: email, logoUrl: logo });
      toast({ title: "Settings saved", description: "Site settings updated successfully.", variant: "success" });
    } catch {
      toast({ title: "Save failed", description: "Couldn't update site settings. Please try again.", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="max-w-lg flex flex-col gap-4">
      <LogoUpload value={logo} onChange={setLogo} />
      <Input label="Site name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Support email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        The site name and logo appear in the sidebar, browser tab, login screen and profile.
      </p>
      <Button className="self-start" size="sm" onClick={handleSave} loading={saving}>
        Save changes
      </Button>
    </Card>
  );
}

const PAGE_SIZE = 12;

function AppearanceTab() {
  const { palette, palettes, paletteId, setPaletteId, mode, toggleMode } = useTheme();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? palettes.filter((p) => p.name.toLowerCase().includes(q)) : palettes;
  }, [palettes, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex items-center justify-between max-w-lg">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Dark mode</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>Toggle light / dark appearance</p>
        </div>
        <Toggle checked={mode === "dark"} onChange={toggleMode} label="Dark mode" />
      </Card>

      <Card className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
            Palette
          </p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            {palettes.length} available — current: <span className="font-medium">{palette.name}</span>. One
            palette applies to both light and dark mode; each card previews both color sets.
          </p>
        </div>

        <Input
          leftIcon={<Search size={15} />}
          placeholder="Search palettes..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pageItems.map((p) => {
            const active = p.id === paletteId;
            return (
              <button
                key={p.id}
                onClick={() => setPaletteId(p.id)}
                aria-pressed={active}
                className="text-left rounded-xl p-3 transition-all duration-150 hover:-translate-y-0.5"
                style={{
                  border: active ? `2px solid ${p.light.accent1}` : "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  boxShadow: active
                    ? `0 0 0 3px color-mix(in srgb, ${p.light.accent1} 20%, transparent)`
                    : "none",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium truncate" style={{ color: "var(--color-foreground)" }}>
                    {p.name}
                  </p>
                  {active && (
                    <span
                      className="flex items-center justify-center h-5 w-5 rounded-full shrink-0"
                      style={{ background: p.light.accent1, color: p.light.surface }}
                    >
                      <Check size={12} />
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  {(["light", "dark"] as const).map((m) => {
                    const t = p[m];
                    return (
                      <div
                        key={m}
                        className="flex items-center gap-2 rounded-lg p-1.5"
                        style={{ background: t.bg, border: "1px solid rgba(0,0,0,0.06)" }}
                      >
                        <span
                          className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-wide"
                          style={{ color: t.text }}
                        >
                          {m}
                        </span>
                        <div className="flex -space-x-1.5">
                          {[t.accent1, t.accent2, t.surface, t.text].map((c, i) => (
                            <span
                              key={i}
                              className="h-5 w-5 rounded-full"
                              style={{ background: c, border: `2px solid ${t.bg}` }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </button>
            );
          })}
          {pageItems.length === 0 && (
            <p className="col-span-full text-sm py-6 text-center" style={{ color: "var(--color-text-muted)" }}>
              No palettes match “{query}”.
            </p>
          )}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Page {safePage + 1} of {pageCount}
            </p>
            <div className="flex items-center gap-1.5">
              <button
                aria-label="Previous page"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="flex items-center justify-center h-8 w-8 rounded-md disabled:opacity-40 hover:bg-black/5 transition-colors duration-150"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                aria-label="Next page"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                className="flex items-center justify-center h-8 w-8 rounded-md disabled:opacity-40 hover:bg-black/5 transition-colors duration-150"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SidebarTab() {
  const { defaultCollapsed, setDefaultCollapsed, compact, setCompact, hoverExpand, setHoverExpand } =
    useSidebarPreference();
  return (
    <Card className="max-w-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Start collapsed</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Sidebar opens in collapsed (icon-only) mode by default.
          </p>
        </div>
        <Toggle checked={defaultCollapsed} onChange={setDefaultCollapsed} label="Start collapsed" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Compact density</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            Tighter spacing between navigation items.
          </p>
        </div>
        <Toggle checked={compact} onChange={setCompact} label="Compact density" />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>Expand on hover</p>
          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            While collapsed, hovering the sidebar temporarily expands it — collapses again when you move away.
          </p>
        </div>
        <Toggle checked={hoverExpand} onChange={setHoverExpand} label="Expand on hover" />
      </div>
    </Card>
  );
}

const TOAST_POSITIONS: { key: ToastPosition; label: string }[] = [
  { key: "top-left", label: "Top Left" },
  { key: "top-center", label: "Top Center" },
  { key: "top-right", label: "Top Right" },
  { key: "bottom-left", label: "Bottom Left" },
  { key: "bottom-center", label: "Bottom Center" },
  { key: "bottom-right", label: "Bottom Right" },
];

const dotAlignClasses: Record<ToastPosition, string> = {
  "top-left": "items-start justify-start",
  "top-center": "items-start justify-center",
  "top-right": "items-start justify-end",
  "bottom-left": "items-end justify-start",
  "bottom-center": "items-end justify-center",
  "bottom-right": "items-end justify-end",
};

function ToastTab() {
  const { position, setPosition, toast } = useToast();

  return (
    <Card className="max-w-lg flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
          Notification position
        </p>
        <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          Choose where toast notifications appear on screen.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {TOAST_POSITIONS.map((opt) => {
          const active = position === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setPosition(opt.key)}
              aria-pressed={active}
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors duration-150"
              style={{
                border: active ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
                background: "var(--color-background)",
              }}
            >
              <div
                className={cn("flex h-14 w-full rounded-md p-1.5", dotAlignClasses[opt.key])}
                style={{ border: "1px dashed var(--color-border)" }}
              >
                <span
                  className="h-2.5 w-6 rounded-full"
                  style={{ background: active ? "var(--color-primary)" : "var(--color-text-muted)" }}
                />
              </div>
              <span className="text-xs font-medium" style={{ color: "var(--color-foreground)" }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          toast({ title: "Preview", description: "This is how your toasts will look.", variant: "info" })
        }
      >
        Send test notification
      </Button>
    </Card>
  );
}

function ApiConfigTab() {
  return (
    <Card className="max-w-lg flex flex-col gap-4">
      <Input label="API Base URL" value={API_BASE_URL} readOnly />
      <Input label="API Version" value={DEFAULT_API_VERSION} readOnly />
      <Input label="Role Scope" value={DEFAULT_ROLE} readOnly />
      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        Requests are built as {API_BASE_URL}/{"{version}"}/{"{role}"}/&lt;resource&gt; — dynamically resolved per request.
      </p>
    </Card>
  );
}

const LOADER_OPTIONS: { key: LoaderStyle; label: string }[] = [
  { key: "skeleton", label: "Skeleton" },
  { key: "spinner", label: "Spinner" },
  { key: "progressbar", label: "Progress Bar" },
  { key: "pulse", label: "Pulse / Shimmer" },
  { key: "dots", label: "Dots" },
  { key: "bar-skeleton", label: "Bar + Skeleton combined" },
];

function LoaderPreview({ style }: { style: LoaderStyle }) {
  switch (style) {
    case "spinner":
      return <Spinner />;
    case "progressbar":
      return <ProgressBar />;
    case "dots":
      return <Dots />;
    case "pulse":
      return <RawSkeleton height={16} className="animate-pulse w-40" />;
    case "bar-skeleton":
      return (
        <div className="flex flex-col gap-2 w-40">
          <ProgressBar />
          <RawSkeleton height={16} />
        </div>
      );
    default:
      return <RawSkeleton height={16} className="w-40" />;
  }
}

function LoaderTab() {
  const { loaderStyle, setLoaderStyle } = useLoaderPreference();
  return (
    <Card className="max-w-lg flex flex-col gap-4">
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Choose how loading states appear across the admin panel.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {LOADER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setLoaderStyle(opt.key)}
            className="flex flex-col items-center gap-3 rounded-lg p-4"
            style={{
              border: loaderStyle === opt.key ? "2px solid var(--color-primary)" : "1px solid var(--color-border)",
              background: "var(--color-background)",
            }}
          >
            <LoaderPreview style={opt.key} />
            <span className="text-xs font-medium" style={{ color: "var(--color-foreground)" }}>{opt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure general, appearance, API and loader preferences." />
      <Tabs
        tabs={[
          { key: "general", label: "General", content: <GeneralTab /> },
          { key: "appearance", label: "Appearance", content: <AppearanceTab /> },
          { key: "sidebar", label: "Sidebar", content: <SidebarTab /> },
          { key: "toasts", label: "Toasts", content: <ToastTab /> },
          { key: "api", label: "API Configuration", content: <ApiConfigTab /> },
          { key: "loader", label: "Loader", content: <LoaderTab /> },
        ]}
      />
    </div>
  );
}
