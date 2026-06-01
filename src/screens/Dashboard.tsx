import { useEffect, useMemo, useState } from "react";
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
  Trash2,
  Pencil,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { healthStats, contractHealth, activeComparisons } from "@/data";
import { useStore } from "@/store/AppStore";
import { useSimulation } from "@/hooks/useSimulation";
import { cn } from "@/lib/utils";

export function Dashboard() {
  const { runs, navigate, addRun, deleteRun, renameRun, updateRun, env, search } =
    useStore();
  const [expandedContract, setExpandedContract] = useState<string | null>(null);

  const sim = useSimulation();
  const [runningId, setRunningId] = useState<string | null>(null);

  // when the suite simulation finishes, settle the running row to a result
  useEffect(() => {
    if (sim.status === "done" && runningId) {
      updateRun(runningId, {
        status: "pass",
        correctPercent: 100,
        p95: "138ms",
        time: "just now",
      });
      setRunningId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sim.status]);

  const runSuite = () => {
    const id = addRun({
      name: `Smoke Suite — ${env.toLowerCase()}`,
      status: "running",
      correctPercent: null,
      p95: "—",
      triggeredBy: "Manual",
      time: "running…",
    });
    setRunningId(id);
    sim.start({ durationMs: 2200, totalRequests: 134 });
  };

  const q = search.trim().toLowerCase();
  const filteredRuns = useMemo(
    () =>
      q
        ? runs.filter(
            (r) =>
              r.name.toLowerCase().includes(q) ||
              r.triggeredBy.toLowerCase().includes(q)
          )
        : runs,
    [runs, q]
  );
  const filteredContracts = useMemo(
    () =>
      q
        ? contractHealth.filter((c) =>
            c.endpoint.toLowerCase().includes(q)
          )
        : contractHealth,
    [q]
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Page heading + quick actions */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
          <p className="text-xs text-muted">
            Overview of API health, recent runs, and contract drift ·{" "}
            <span className="text-text-primary">{env}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm">
            <Plus className="h-3.5 w-3.5" /> New Collection
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={runSuite}
            disabled={sim.status === "running"}
          >
            {sim.status === "running" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Run Suite
          </Button>
          <Button variant="secondary" size="sm">
            <Upload className="h-3.5 w-3.5" /> Import OpenAPI Spec
          </Button>
          <Button size="sm" onClick={() => navigate("workflow")}>
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
          value={runs[0]?.time === "just now" ? "just now — 134/134" : healthStats.lastRun}
          sub={`${runs[0]?.name ?? "Smoke Suite"} · ${env}`}
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
            <CardTitle>
              Recent Test Runs{" "}
              <span className="ml-1 font-normal text-muted">
                ({filteredRuns.length})
              </span>
            </CardTitle>
            <span className="text-2xs text-muted">
              Click a name to rename · hover to delete
            </span>
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
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {filteredRuns.map((r) => (
                  <RunRow
                    key={r.id}
                    run={r}
                    onRename={(name) => renameRun(r.id, name)}
                    onDelete={() => deleteRun(r.id)}
                  />
                ))}
                {filteredRuns.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-muted"
                    >
                      No runs match “{search}”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Active comparisons */}
        <Card>
          <CardHeader>
            <CardTitle>Active Comparisons</CardTitle>
            <button
              onClick={() => navigate("compare")}
              className="flex items-center gap-1 text-xs text-accent hover:underline"
            >
              Compare <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {activeComparisons.map((c) => (
              <button
                key={c.pr}
                onClick={() => navigate("compare")}
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
              {filteredContracts.map((c) => {
                const open = expandedContract === c.endpoint;
                return (
                  <tr
                    key={c.endpoint}
                    onClick={() =>
                      c.detail &&
                      setExpandedContract(open ? null : c.endpoint)
                    }
                    className={cn(
                      "border-b border-border-muted last:border-0 align-top",
                      c.detail && "cursor-pointer hover:bg-surface-2/60"
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {c.detail ? (
                          <ChevronRight
                            className={cn(
                              "h-3.5 w-3.5 text-muted transition-transform",
                              open && "rotate-90"
                            )}
                          />
                        ) : (
                          <span className="w-3.5" />
                        )}
                        <span className="mono text-text-primary">
                          {c.endpoint}
                        </span>
                      </div>
                      {c.detail && open && (
                        <div className="mt-1.5 ml-5 rounded-md border border-border bg-bg p-2 text-2xs">
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
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Run-suite progress toast */}
      {sim.status === "running" && (
        <div className="fixed bottom-4 right-4 z-40 w-72 rounded-lg border border-border bg-surface p-3 shadow-xl">
          <div className="mb-2 flex items-center gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
            <span className="text-xs font-semibold">
              Running Smoke Suite — {env}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
            <div
              className="h-full rounded-full bg-accent transition-all duration-100"
              style={{ width: `${Math.round(sim.progress * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 mono text-2xs text-muted">
            {sim.requests}/134 tests · {sim.correctness.toFixed(0)}% correct
          </p>
        </div>
      )}
    </div>
  );
}

function RunRow({
  run,
  onRename,
  onDelete,
}: {
  run: ReturnType<typeof useStore>["runs"][number];
  onRename: (name: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(run.name);

  const save = () => {
    const v = draft.trim();
    if (v) onRename(v);
    else setDraft(run.name);
    setEditing(false);
  };

  return (
    <tr className="group border-b border-border-muted last:border-0 hover:bg-surface-2/60">
      <td className="px-4 py-2.5 font-medium text-text-primary">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={save}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") {
                setDraft(run.name);
                setEditing(false);
              }
            }}
            className="w-full rounded border border-accent bg-bg px-1.5 py-0.5 text-xs text-text-primary focus:outline-none"
          />
        ) : (
          <button
            onClick={() => {
              setDraft(run.name);
              setEditing(true);
            }}
            className="flex items-center gap-1.5 text-left hover:text-accent"
          >
            {run.name}
            <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
          </button>
        )}
      </td>
      <td className="px-3 py-2.5">
        <StatusPill
          kind={run.status}
          label={
            run.status === "pass"
              ? "Pass"
              : run.status === "fail"
              ? "Fail"
              : "Running…"
          }
        />
      </td>
      <td className="px-3 py-2.5 text-right mono">
        {run.correctPercent === null ? (
          <span className="text-text-primary">—</span>
        ) : run.correctPercent < 99 ? (
          <span className="rounded bg-danger/10 px-1.5 py-0.5 font-semibold text-danger ring-1 ring-inset ring-danger/20">
            {run.correctPercent}%
          </span>
        ) : (
          <span className="text-text-primary">{run.correctPercent}%</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right mono text-muted">{run.p95}</td>
      <td className="px-3 py-2.5">
        <span className="mono text-accent">{run.triggeredBy}</span>
      </td>
      <td className="px-4 py-2.5 text-right text-muted">{run.time}</td>
      <td className="px-2 py-2.5">
        <button
          onClick={onDelete}
          className="opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
          title="Delete run"
        >
          <Trash2 className="h-3.5 w-3.5 text-muted hover:text-danger" />
        </button>
      </td>
    </tr>
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
