import { useState } from "react";
import {
  ChevronDown,
  Play,
  GitBranch,
  XCircle,
  Radio,
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
import type { DiffStatus } from "@/data/types";
import { DiffViewer } from "./compare/DiffViewer";
import { PrComment } from "./compare/PrComment";
import { cn } from "@/lib/utils";

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

export function Compare() {
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState("/orders");

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
            branch={compareMeta.baseline}
            env={compareMeta.baselineEnv}
          />
          <span className="pb-2 text-muted">vs</span>
          <BranchSelect
            label="Candidate"
            branch={compareMeta.candidate}
            env={compareMeta.candidateEnv}
          />
          <div className="flex flex-col gap-1">
            <span className="text-2xs uppercase tracking-wide text-muted">
              Test suite
            </span>
            <Selector value="Full Regression" />
          </div>
          <Button size="default" className="mb-px">
            <Play className="h-3.5 w-3.5" /> Run Comparison
          </Button>

          <div className="ml-auto flex items-center gap-2 rounded-md border border-accent/30 bg-accent/[0.07] px-3 py-1.5">
            <Radio className="h-3.5 w-3.5 animate-pulse text-accent" />
            <span className="text-2xs text-text-primary">
              Auto-running on{" "}
              <span className="font-semibold">{compareMeta.pr}</span> (opened{" "}
              {compareMeta.opened})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Diff summary header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">
            Comparison:{" "}
            <span className="mono font-normal text-muted">
              {compareMeta.baseline} vs {compareMeta.candidate}
            </span>
          </h2>
          <span className="mono text-2xs text-accent">{compareMeta.pr}</span>
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
                const clickable = e.status !== "unchanged";
                return (
                  <tr
                    key={`${e.method} ${e.endpoint}`}
                    onClick={() => clickable && setSelected(e.endpoint)}
                    className={cn(
                      "border-b border-border-muted last:border-0",
                      clickable && "cursor-pointer hover:bg-surface-2/60",
                      isSel && "bg-accent/[0.06]"
                    )}
                  >
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        {isSel && (
                          <span className="h-3.5 w-0.5 rounded-full bg-accent" />
                        )}
                        <span className="mono text-text-primary">
                          {e.endpoint}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 mono text-muted">{e.method}</td>
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
          <DiffViewer />
        </div>
        <div className="lg:col-span-2">
          <PrComment />
        </div>
      </div>
    </div>
  );
}

function BranchSelect({
  label,
  branch,
  env,
}: {
  label: string;
  branch: string;
  env: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xs uppercase tracking-wide text-muted">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <button className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-bg px-2.5 text-xs text-text-primary hover:border-accent">
          <GitBranch className="h-3.5 w-3.5 text-muted" />
          <span className="mono">{branch}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </button>
        <Selector value={env} />
      </div>
    </div>
  );
}

function Selector({ value }: { value: string }) {
  return (
    <button className="flex h-8 items-center justify-between gap-1.5 rounded-md border border-border bg-bg px-2.5 text-xs text-text-primary hover:border-accent">
      {value}
      <ChevronDown className="h-3.5 w-3.5 text-muted" />
    </button>
  );
}
