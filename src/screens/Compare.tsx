import { useEffect, useState } from "react";
import {
  ChevronDown,
  Play,
  GitBranch,
  XCircle,
  Radio,
  Loader2,
  ScanSearch,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill, type StatusKind } from "@/components/StatusPill";
import {
  compareMeta,
  endpointDiffs,
  diffFilterCounts,
  unchangedRemaining,
} from "@/data";
import type { DiffStatus, EndpointDiff } from "@/data/types";
import { useStore } from "@/store/AppStore";
import { useSimulation } from "@/hooks/useSimulation";
import { DiffViewer } from "./compare/DiffViewer";
import { PrComment } from "./compare/PrComment";
import { cn } from "@/lib/utils";

const BRANCHES = [
  "main",
  "develop",
  "release/2.4",
  "feature/payment-v2",
  "feature/bulk-orders",
  "fix/user-auth",
  "hotfix/tax-rounding",
];

const ENVIRONMENTS = [
  "test-env-A",
  "test-env-B",
  "staging",
  "production",
  "local",
];

const SUITES = [
  "Full Regression",
  "Smoke Tests",
  "Auth Flows",
  "Checkout Flows",
  "Order Management",
  "Load: Create Order",
];

type Filter = "all" | "breaking" | "changed" | "slower" | "safe";

const FILTERS: { key: Filter; label: string; count: number }[] = [
  { key: "all", label: "All", count: diffFilterCounts.all },
  { key: "breaking", label: "Breaking", count: diffFilterCounts.breaking },
  { key: "changed", label: "Changed", count: diffFilterCounts.changed },
  { key: "slower", label: "Slower", count: diffFilterCounts.slower },
  { key: "safe", label: "Safe", count: diffFilterCounts.safe },
];

const STATUS_KIND: Record<DiffStatus, StatusKind> = {
  breaking: "breaking",
  changed: "changed",
  slower: "slower",
  unchanged: "safe",
};

const STATUS_LABEL: Record<DiffStatus, string> = {
  breaking: "BREAKING",
  changed: "CHANGED",
  slower: "SLOWER",
  unchanged: "UNCHANGED",
};

const SCAN_LOG = [
  "Connecting to test-env-A (main)…",
  "Connecting to test-env-B (feature/payment-v2)…",
  "Replaying 50 sample requests per endpoint…",
  "Diffing response schemas & latencies…",
  "Cross-referencing OpenAPI spec…",
];

export function Compare() {
  const { env } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState("/orders");
  const [baseline, setBaseline] = useState(compareMeta.baseline);
  const [candidate, setCandidate] = useState(compareMeta.candidate);
  const [baselineEnv, setBaselineEnv] = useState(compareMeta.baselineEnv);
  const [candidateEnv, setCandidateEnv] = useState(compareMeta.candidateEnv);
  const [suite, setSuite] = useState("Full Regression");
  const sameBranch = baseline === candidate;
  const sim = useSimulation();
  const scanning = sim.status === "running";
  const [logIdx, setLogIdx] = useState(0);

  // advance the scan log while scanning
  useEffect(() => {
    if (!scanning) return;
    setLogIdx(Math.min(SCAN_LOG.length - 1, Math.floor(sim.progress * SCAN_LOG.length)));
  }, [scanning, sim.progress]);

  const selectedDiff: EndpointDiff =
    endpointDiffs.find((e) => e.endpoint === selected) ?? endpointDiffs[0];

  const rows = endpointDiffs.filter((e) => {
    if (filter === "all") return true;
    if (filter === "safe") return e.status === "unchanged";
    return e.status === filter;
  });

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Comparison setup */}
      <Card className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-x-6 gap-y-3 p-4">
          <BranchSelect
            label="Baseline"
            branch={baseline}
            setBranch={setBaseline}
            env={baselineEnv}
            setEnv={setBaselineEnv}
          />
          <span className="pb-2 text-muted">vs</span>
          <BranchSelect
            label="Candidate"
            branch={candidate}
            setBranch={setCandidate}
            env={candidateEnv}
            setEnv={setCandidateEnv}
          />
          <div className="flex flex-col gap-1">
            <span className="text-2xs uppercase tracking-wide text-muted">
              Test suite
            </span>
            <Combo value={suite} options={SUITES} onChange={setSuite} width={150} />
          </div>
          <div className="flex flex-col gap-1">
            <Button
              size="default"
              disabled={scanning || sameBranch}
              onClick={() => sim.start({ durationMs: 2400, totalRequests: 47 })}
            >
              {scanning ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
              {scanning ? "Comparing…" : "Run Comparison"}
            </Button>
            {sameBranch && (
              <span className="flex items-center gap-1 text-2xs text-warning">
                <AlertTriangle className="h-3 w-3" />
                Pick two different branches
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 rounded-md border border-accent/30 bg-accent/[0.07] px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 animate-pulse text-accent" />
            <span className="text-2xs text-text-primary">
              Auto-running on{" "}
              <span className="font-semibold">{compareMeta.pr}</span> · {env}
            </span>
          </div>
        </CardContent>
      </Card>

      {scanning ? (
        <ScanningPanel
          progress={sim.progress}
          scanned={Math.round(sim.progress * 47)}
          log={SCAN_LOG.slice(0, logIdx + 1)}
          baseline={baseline}
          candidate={candidate}
          suite={suite}
        />
      ) : (
        <>
          {/* Diff summary header */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">
                Comparison:{" "}
                <span className="mono font-normal text-muted">
                  {baseline} vs {candidate}
                </span>
                <span className="ml-1.5 font-normal text-muted">· {suite}</span>
              </h2>
              <span className="mono text-2xs text-accent">
                {compareMeta.pr}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-2xs font-medium text-danger">
                <XCircle className="h-3 w-3" />
                {compareMeta.breakingCount} breaking changes
              </span>
            </div>
          </div>

          {/* Filter chips */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === f.key
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface text-muted hover:text-text-primary"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 text-2xs",
                    filter === f.key ? "bg-accent/20" : "bg-surface-2"
                  )}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Endpoint diff table */}
          <Card className="mb-4">
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-2xs uppercase tracking-wide text-muted">
                    <th className="px-4 py-2 font-medium">Endpoint</th>
                    <th className="px-3 py-2 font-medium">Method</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Change Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => {
                    const isSel = selected === e.endpoint;
                    return (
                      <tr
                        key={`${e.method} ${e.endpoint}`}
                        onClick={() => setSelected(e.endpoint)}
                        className={cn(
                          "cursor-pointer border-b border-l-2 border-border-muted border-l-transparent last:border-b-0 hover:bg-surface-2/60",
                          isSel && "border-l-accent bg-accent/[0.06]"
                        )}
                      >
                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              "mono",
                              isSel
                                ? "font-medium text-text-primary"
                                : "text-text-primary"
                            )}
                          >
                            {e.endpoint}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 mono text-muted">
                          {e.method}
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusPill
                            kind={STATUS_KIND[e.status]}
                            label={STATUS_LABEL[e.status]}
                          />
                        </td>
                        <td className="px-4 py-2.5 mono text-muted">
                          {e.summary}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filter === "all" && (
                <div className="border-t border-border-muted px-4 py-2 text-2xs text-muted">
                  … {unchangedRemaining} more unchanged endpoints
                </div>
              )}
            </CardContent>
          </Card>

          {/* Diff viewer + PR comment */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <DiffViewer selected={selectedDiff} />
            </div>
            <div className="lg:col-span-2">
              <PrComment />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ScanningPanel({
  progress,
  scanned,
  log,
  baseline,
  candidate,
  suite,
}: {
  progress: number;
  scanned: number;
  log: string[];
  baseline: string;
  candidate: string;
  suite: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <ScanSearch className="h-4 w-4 animate-pulse text-accent" />
          <span className="text-sm font-semibold">
            Comparing{" "}
            <span className="mono font-normal text-muted">{baseline}</span> vs{" "}
            <span className="mono font-normal text-muted">{candidate}</span>
          </span>
          <span className="ml-3 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-2xs text-muted">
            {suite}
          </span>
          <span className="ml-auto mono text-2xs text-muted">
            {scanned}/47 endpoints
          </span>
        </div>
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-bg">
          <div
            className="h-full rounded-full bg-accent transition-all duration-100"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="space-y-1 rounded-md border border-border bg-bg p-3 mono text-2xs text-muted">
          {log.map((l) => (
            <p key={l} className="flex items-center gap-1.5">
              <span className="text-success">✓</span> {l}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BranchSelect({
  label,
  branch,
  setBranch,
  env,
  setEnv,
}: {
  label: string;
  branch: string;
  setBranch: (v: string) => void;
  env: string;
  setEnv: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <Combo
          value={branch}
          options={BRANCHES}
          onChange={setBranch}
          icon={<GitBranch className="h-3.5 w-3.5 text-muted" />}
          mono
          width={180}
        />
        <Combo value={env} options={ENVIRONMENTS} onChange={setEnv} width={120} />
      </div>
    </div>
  );
}

/** Reusable click-to-open dropdown. */
function Combo({
  value,
  options,
  onChange,
  icon,
  mono,
  width,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  mono?: boolean;
  width?: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" style={{ width }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-border bg-bg px-2.5 text-xs text-text-primary hover:border-accent"
      >
        <span className="flex items-center gap-1.5 truncate">
          {icon}
          <span className={cn("truncate", mono && "mono")}>{value}</span>
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-50 max-h-64 w-full min-w-[140px] overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-xl">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-surface-2",
                  mono && "mono",
                  o === value ? "text-accent" : "text-text-primary"
                )}
              >
                {o}
                {o === value && (
                  <Check className="ml-auto h-3.5 w-3.5 text-accent" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
