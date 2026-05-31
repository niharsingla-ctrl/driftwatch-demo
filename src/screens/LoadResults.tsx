import { useState } from "react";
import {
  ChevronRight,
  Users,
  Clock,
  Server,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { AiCallout } from "@/components/AiCallout";
import {
  loadRunMeta,
  stepResults,
  sampleFailures,
  loadAiAnalysis,
} from "@/data";
import {
  CorrectnessChart,
  ResponseTimeChart,
  ErrorsByStepChart,
} from "./load/LoadCharts";
import { cn } from "@/lib/utils";

export function LoadResults() {
  const [expanded, setExpanded] = useState<string | null>("create_order");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Top metadata bar */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="mono text-base font-semibold text-text-primary">
          {loadRunMeta.name}
        </h1>
        <Meta Icon={Users} text={`${loadRunMeta.users} users`} />
        <Meta Icon={Clock} text={loadRunMeta.duration} />
        <Meta Icon={Server} text={loadRunMeta.environment} />
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-danger/40 bg-danger/10 px-2.5 py-1 text-xs font-semibold text-danger">
          <StatusPill kind="fail" iconOnly /> FAILED
        </span>
      </div>

      {/* Summary stat row */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xs uppercase tracking-wide text-muted">
              Overall Correctness
            </p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span className="mono text-2xl font-bold text-danger">
                {loadRunMeta.overallCorrectness}%
              </span>
              <span className="text-2xs text-muted">
                target: {loadRunMeta.targetCorrectness}%
              </span>
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg">
              <div
                className="h-full rounded-full bg-danger"
                style={{ width: `${loadRunMeta.overallCorrectness}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <SummaryStat
          label="Total Requests"
          value={loadRunMeta.totalRequests.toLocaleString()}
        />
        <SummaryStat
          label="Correct Responses"
          value={loadRunMeta.correctResponses.toLocaleString()}
          tone="success"
        />
        <SummaryStat
          label="Failed Assertions"
          value={loadRunMeta.failedAssertions.toLocaleString()}
          tone="danger"
        />
      </div>

      {/* Per-step table */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Per-Step Breakdown</CardTitle>
          <span className="text-2xs text-muted">
            Click any row to see individual failed responses
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border text-2xs uppercase tracking-wide text-muted">
                <th className="px-4 py-2 text-left font-medium">Step</th>
                <th className="px-3 py-2 text-right font-medium">Requests</th>
                <th className="px-3 py-2 text-right font-medium">Correct</th>
                <th className="px-3 py-2 text-right font-medium">Wrong</th>
                <th className="px-3 py-2 text-right font-medium">Correct%</th>
                <th className="px-3 py-2 text-right font-medium">p50</th>
                <th className="px-3 py-2 text-right font-medium">p95</th>
                <th className="px-4 py-2 text-right font-medium">p99</th>
              </tr>
            </thead>
            <tbody>
              {stepResults.map((s) => {
                const isOpen = expanded === s.stepId;
                const clickable = s.failures.length > 0;
                return (
                  <FragmentRow
                    key={s.stepId}
                    open={isOpen}
                    clickable={clickable}
                    onToggle={() =>
                      clickable && setExpanded(isOpen ? null : s.stepId)
                    }
                    step={s}
                  />
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Failure detail + AI analysis */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Failure:{" "}
              <span className="mono font-normal text-danger">
                body.items.length == 1
              </span>
            </CardTitle>
            <span className="text-2xs text-muted">1,204 occurrences</span>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xs uppercase tracking-wide text-muted">
              Sample failures
            </p>
            {sampleFailures.map((f) => (
              <div
                key={f.requestId}
                className="rounded-md border border-border bg-bg p-3"
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="mono text-xs font-semibold text-accent">
                    Request {f.requestId}
                  </span>
                  <span className="mono text-2xs text-muted">at {f.at}</span>
                </div>
                <div className="space-y-1 mono text-2xs leading-relaxed">
                  <Line label="Sent" className="text-text-primary">
                    {f.sent}
                  </Line>
                  <Line label="Expected" className="text-muted">
                    {f.expected}
                  </Line>
                  <Line label="Got" className="text-danger">
                    {f.got}{" "}
                    <span className="text-warning">← {f.gotNote}</span>
                  </Line>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <AiCallout className="flex-1">{loadAiAnalysis}</AiCallout>
          <Button variant="secondary" size="sm" className="self-start">
            <Sparkles className="h-3.5 w-3.5 text-[#bc8cff]" />
            Explain in workflow context
          </Button>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CorrectnessChart />
        <ResponseTimeChart />
        <ErrorsByStepChart />
      </div>
    </div>
  );
}

function FragmentRow({
  step,
  open,
  clickable,
  onToggle,
}: {
  step: (typeof stepResults)[number];
  open: boolean;
  clickable: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={cn(
          "border-b border-border-muted",
          clickable && "cursor-pointer hover:bg-surface-2/60",
          step.failed && "bg-danger/[0.04]"
        )}
      >
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            {clickable ? (
              <ChevronRight
                className={cn(
                  "h-3.5 w-3.5 text-muted transition-transform",
                  open && "rotate-90"
                )}
              />
            ) : (
              <span className="w-3.5" />
            )}
            <span className="mono font-medium text-text-primary">
              {step.name}
            </span>
            <span className="mono text-2xs text-muted">{step.endpoint}</span>
          </div>
        </td>
        <td className="px-3 py-2.5 text-right mono text-muted">
          {step.requests.toLocaleString()}
        </td>
        <td className="px-3 py-2.5 text-right mono text-success">
          {step.correct.toLocaleString()}
        </td>
        <td
          className={cn(
            "px-3 py-2.5 text-right mono",
            step.wrong > 0 ? "text-danger" : "text-muted"
          )}
        >
          {step.wrong.toLocaleString()}
        </td>
        <td className="px-3 py-2.5 text-right">
          <span
            className={cn(
              "mono font-semibold",
              step.failed ? "text-danger" : "text-text-primary"
            )}
          >
            {step.correctPercent.toFixed(2)}%
          </span>
          {step.failed && <span className="ml-1 text-danger">❌</span>}
        </td>
        <td className="px-3 py-2.5 text-right mono text-muted">{step.p50}</td>
        <td className="px-3 py-2.5 text-right mono text-muted">{step.p95}</td>
        <td className="px-4 py-2.5 text-right mono text-muted">{step.p99}</td>
      </tr>

      {/* inline assertion-fail summary rows */}
      {step.failures.map((f) => (
        <tr
          key={f.expression}
          className="border-b border-border-muted bg-bg/40"
        >
          <td colSpan={8} className="px-4 py-1.5">
            <div className="flex items-center gap-1.5 mono text-2xs text-muted">
              <span className="pl-5 text-border">└</span>
              <span className="text-danger/90">
                assert fail: {f.expression}
              </span>
              <span className="text-muted">
                ({f.count.toLocaleString()} times)
              </span>
            </div>
          </td>
        </tr>
      ))}

      {/* expanded detail callout */}
      {open && step.failed && (
        <tr className="bg-bg/40">
          <td colSpan={8} className="px-4 pb-3 pt-1">
            <div className="rounded-md border border-border bg-surface p-3">
              <p className="text-2xs text-muted">
                Showing the highest-frequency failure for{" "}
                <span className="mono text-text-primary">{step.name}</span>.
                Full per-request samples and the AI race-condition analysis are
                shown in the failure panel below.
              </p>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Meta({ Icon, text }: { Icon: typeof Users; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 py-1 text-2xs text-muted">
      <Icon className="h-3 w-3" />
      {text}
    </span>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xs uppercase tracking-wide text-muted">{label}</p>
        <p
          className={cn(
            "mt-1 mono text-2xl font-bold",
            tone === "success"
              ? "text-success"
              : tone === "danger"
              ? "text-danger"
              : "text-text-primary"
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function Line({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex gap-2">
      <span className="w-16 shrink-0 text-muted">{label}:</span>
      <span className={cn("flex items-center gap-1", className)}>
        {label === "Sent" && (
          <ArrowRight className="h-3 w-3 shrink-0 text-border" />
        )}
        <span>{children}</span>
      </span>
    </div>
  );
}
