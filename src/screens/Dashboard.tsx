import {
  Activity,
  FileWarning,
  Clock,
  Plus,
  Play,
  Upload,
  Workflow as WorkflowIcon,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import {
  healthStats,
  recentRuns,
  contractHealth,
  activeComparisons,
} from "@/data";
import { cn } from "@/lib/utils";
import type { ScreenId } from "@/App";

export function Dashboard({
  onNavigate,
}: {
  onNavigate: (id: ScreenId) => void;
}) {
  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Page heading + quick actions */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted">
            Overview of API health, recent runs, and contract drift.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            <Plus className="h-3.5 w-3.5" /> New Collection
          </Button>
          <Button variant="secondary" size="sm">
            <Play className="h-3.5 w-3.5" /> Run Suite
          </Button>
          <Button variant="secondary" size="sm">
            <Upload className="h-3.5 w-3.5" /> Import OpenAPI Spec
          </Button>
          <Button size="sm" onClick={() => onNavigate("workflow")}>
            <WorkflowIcon className="h-3.5 w-3.5" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Health overview — 3 stat cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="API Health"
          value={healthStats.apiHealth}
          sub="across 47 monitored endpoints"
          accent="success"
          Icon={Activity}
        />
        <StatCard
          label="Open Contracts"
          value={healthStats.openContracts}
          sub="1 breaking · 2 drift detected"
          accent="warning"
          Icon={FileWarning}
        />
        <StatCard
          label="Last Run"
          value={healthStats.lastRun}
          sub="Smoke Suite — staging · 4 min ago"
          accent="success"
          Icon={Clock}
          checkmark
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent runs — spans 2 cols */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Test Runs</CardTitle>
            <button className="flex items-center gap-1 text-xs text-accent hover:underline">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-left text-2xs uppercase tracking-wide text-muted">
                  <th className="px-4 py-2 font-medium">Run Name</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Correct%</th>
                  <th className="px-3 py-2 text-right font-medium">p95</th>
                  <th className="px-3 py-2 font-medium">Triggered By</th>
                  <th className="px-4 py-2 text-right font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((r) => (
                  <tr
                    key={r.name}
                    className="group border-b border-border-muted last:border-0 hover:bg-surface-2/60"
                  >
                    <td className="px-4 py-2.5 font-medium text-text-primary">
                      {r.name}
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusPill
                        kind={r.status}
                        label={
                          r.status === "pass"
                            ? "Pass"
                            : r.status === "fail"
                            ? "Fail"
                            : "Running"
                        }
                      />
                    </td>
                    <td
                      className={cn(
                        "px-3 py-2.5 text-right mono",
                        r.correctPercent !== null && r.correctPercent < 99
                          ? "text-danger"
                          : "text-text-primary"
                      )}
                    >
                      {r.correctPercent !== null
                        ? `${r.correctPercent}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right mono text-muted">
                      {r.p95}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="mono text-accent">{r.triggeredBy}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-muted">
                      {r.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Active comparisons */}
        <Card>
          <CardHeader>
            <CardTitle>Active Comparisons</CardTitle>
            <button
              onClick={() => onNavigate("compare")}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Compare <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {activeComparisons.map((c) => (
              <button
                key={c.pr}
                onClick={() => onNavigate("compare")}
                className="block w-full rounded-md border border-border bg-bg/40 p-2.5 text-left transition-colors hover:border-accent/40 hover:bg-surface-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text-primary">
                    {c.pr}
                    <span className="ml-1.5 mono font-normal text-muted">
                      {c.branch}
                    </span>
                  </span>
                  <StatusPill
                    kind={c.status}
                    label={
                      c.status === "running"
                        ? "Running…"
                        : c.status === "safe"
                        ? "Safe"
                        : "Blocked"
                    }
                  />
                </div>
                <p className="mt-1 text-2xs text-muted">{c.summary}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Contract health — full width below */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Contract Health</CardTitle>
          <span className="text-2xs text-muted">
            OpenAPI drift monitoring · ecommerce-api-v2.yaml
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-left text-2xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2 font-medium">Endpoint</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium">
                  Last checked
                </th>
              </tr>
            </thead>
            <tbody>
              {contractHealth.map((c) => (
                <tr
                  key={c.endpoint}
                  className="border-b border-border-muted last:border-0 align-top hover:bg-surface-2/60"
                >
                  <td className="px-4 py-2.5">
                    <span className="mono text-text-primary">{c.endpoint}</span>
                    {c.detail && (
                      <div className="mt-1 flex items-start gap-1.5 text-2xs text-muted">
                        <span className="mono text-border">└</span>
                        <span
                          className={cn(
                            c.status === "breaking"
                              ? "text-danger/90"
                              : "text-warning/90"
                          )}
                        >
                          {c.detail}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusPill
                      kind={c.status}
                      label={
                        c.status === "clean"
                          ? "Clean"
                          : c.status === "drift"
                          ? "Drift"
                          : "Breaking"
                      }
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right text-muted">
                    {c.lastChecked}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  Icon,
  checkmark,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "success" | "warning" | "danger";
  Icon: typeof Activity;
  checkmark?: boolean;
}) {
  const accentColor = {
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  }[accent];
  const accentBg = {
    success: "bg-success/10",
    warning: "bg-warning/10",
    danger: "bg-danger/10",
  }[accent];

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start gap-3 p-4">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            accentBg,
            accentColor
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="min-w-0">
          <p className="text-2xs uppercase tracking-wide text-muted">{label}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-base font-semibold text-text-primary">
            {value}
            {checkmark && (
              <StatusPill kind="pass" iconOnly className="text-success" />
            )}
          </p>
          <p className="mt-0.5 truncate text-2xs text-muted">{sub}</p>
        </div>
      </CardContent>
    </Card>
  );
}
