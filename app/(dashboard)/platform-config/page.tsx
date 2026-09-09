"use client";

import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Settings2, Server, Tag } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { PageError } from "@/components/ui/ErrorState";
import { useToast } from "@/providers/ToastProvider";
import { getApiVersionConfig, updateApiVersionConfig } from "@/services/settings";
import { API_BASE_URL, DEFAULT_ROLE } from "@/lib/apiConfig";

export default function PlatformConfigPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [version, setVersion] = useState("");

  const query = useQuery({
    queryKey: ["platform-config", "api-version"],
    queryFn: () => getApiVersionConfig(),
  });

  useEffect(() => {
    if (query.data?.data?.version) setVersion(query.data.data.version);
  }, [query.data]);

  const updateMutation = useMutation({
    mutationFn: () => updateApiVersionConfig(version.trim()),
    onSuccess: () => {
      toast({ title: "Platform config updated", description: "API version updated successfully.", variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["platform-config"] });
    },
    onError: (err) => {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message || "Failed to update API version.";
      toast({ title: "Update failed", description: message, variant: "error" });
    },
  });

  return (
    <div>
      <PageHeader
        title="Platform Configuration"
        description="Manage the platform-wide API version and environment settings."
      />

      {query.isLoading && (
        <Card className="max-w-lg flex flex-col gap-4">
          <Skeleton height={16} width="40%" />
          <Skeleton height={40} />
          <Skeleton height={36} width="30%" />
        </Card>
      )}

      {query.isError && <PageError onRetry={() => query.refetch()} />}

      {!query.isLoading && !query.isError && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-4xl">
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Settings2 size={18} style={{ color: "var(--color-primary)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                Active API Version
              </p>
            </div>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              This is the version every admin request must match — requests using a different
              version are rejected by the API gateway.
            </p>
            <Input
              label="Version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v1"
            />
            <Button
              className="self-start"
              size="sm"
              loading={updateMutation.isPending}
              disabled={!version.trim()}
              onClick={() => updateMutation.mutate()}
            >
              Save changes
            </Button>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Server size={18} style={{ color: "var(--color-primary)" }} />
              <p className="text-sm font-semibold" style={{ color: "var(--color-foreground)" }}>
                Environment
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>API base URL</span>
                <span className="font-medium" style={{ color: "var(--color-foreground)" }}>{API_BASE_URL}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Role scope</span>
                <span className="inline-flex items-center gap-1 font-medium" style={{ color: "var(--color-foreground)" }}>
                  <Tag size={13} /> {DEFAULT_ROLE}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: "var(--color-text-muted)" }}>Last updated</span>
                <span className="font-medium" style={{ color: "var(--color-foreground)" }}>
                  {query.data?.data?.updatedAt ? new Date(query.data.data.updatedAt).toLocaleString() : "—"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
