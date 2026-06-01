import { useState } from "react";
import {
  ChevronRight,
  Users,
  Clock,
  Server,
  ArrowRight,
  Sparkles,
  RotateCw,
  Pencil,
  Wrench,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/StatusPill";
import { AiCallout } from "@/components/AiCallout";
import { RunOverlay } from "@/components/RunOverlay";
import { useStore } from "@/store/AppStore";
import { sampleFailures, loadAiAnalysis } from "@/data";
import type { StepResult } from "@/data/types";
import {
  CorrectnessChart,
  ResponseTimeChart,
  ErrorsByStepChart,
} from "./load/LoadCharts";
import { cn } from "@/lib/utils";

export function LoadResults() {
  const { loadRun, setLoadRun, setLoadTarget, navigate, addNode } = useStore();
  const stepResults = loadRun.steps;
  const [expanded, setExpanded] = useState<string | null>("create_order");
  const [fixOpen, setFixOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState(false);
  const [rerunning, setRerunning] = useState(false);

  const passed = loadRun.overallCorrectness >= loadRun.targetCorrectness;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-5">
      {/* Top metadata bar */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="mono text-base font-semibold text-text-primary">
          {loadRun.name}
        </h1>
        <Meta Icon={Users} text={`${loadRun.users} users`} />
        <Meta Icon={Clock} text={loadRun.duration} />
        <Meta Icon={Server} text={loadRun.environment} />
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => setRerunning(true)}>
            <RotateCw className="h-3.5 w-3.5" /> Re-run
          </Button>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold",
              passed
                ? "border-success/40 bg-success/10 text-success"
                : "border-danger/40 bg-danger/10 text-danger"
            )}
          >
            <StatusPill kind={passed ? "pass" : "fail"} iconOnly />
            {passed ? "PASSED" : "FAILED"}
          </span>
        </div>
      </div>

      {/* Summary stat row */}
      <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-2xs uppercase tracking-wide text-muted">
              Overall Correctness
            </p>
            <p className="mt-1 flex items-baseline gap-1.5">
              <span
                className={cn(
                  "mono text-2xl font-bold",
                  passed ? "text-success" : "text-danger"
                )}
              >
                {loadRun.overallCorrectness}%
              </span>
              {editingTarget ? (
                <span className="flex items-center gap-1 text-2xs text-muted">
                  target:
                  <input
                    autoFocus
                    type="number"
                    defaultValue={loadRun.targetCorrectness}
                    onBlur={(e) => {
                      setLoadTarget(Number(e.target.value) || 99);
                      setEditingTarget(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setLoadTarget(
                          Number((e.target as HTMLInputElement).value) || 99
                        );
                        setEditingTarget(false);
                      }
                    }}
                    className="w-12 rounded border border-accent bg-bg px-1 mono text-2xs text-text-primary focus:outline-none"
                  />
                  %
                </span>
              ) : (
                <button
                  onClick={() => setEditingTarget(true)}
                  className="group flex items-center gap-1 text-2xs text-muted hover:text-text-primary"
                >
                  target: {loadRun.targetCorrectness}%
                  <Pencil className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60" />
                </button>
              )}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-bg">
              <div
                className={cn(
                  "h-full rounded-full",
                  passed ? "bg-success" : "bg-danger"
                )}
                style={{ width: `${loadRun.overallCorrectness}%` }}
              />
            </div>
          </CardContent>
        </Card>
        <SummaryStat
          label="Total Requests"
          value={loadRun.totalRequests.toLocaleString()}
        />
        <SummaryStat
          label="Correct Responses"
          value={loadRun.correctResponses.toLocaleString()}
          tone="success"
        />
        <SummaryStat
          label="Failed Assertions"
          value={loadRun.failedAssertions.toLocaleString()}
          tone="danger"
        />
      </div>

      {rerunning && (
        <RunOverlay
          fixed
          title={loadRun.name}
          users={loadRun.users}
          durationLabel={loadRun.duration}
          environment={loadRun.environment}
          ctaLabel="Apply results"
          onClose={() => setRerunning(false)}
          onViewResults={(final) => {
            setLoadRun({
              ...loadRun,
              status: final.overallCorrectness < loadRun.targetCorrectness
                ? "failed"
                : "passed",
              overallCorrectness: final.overallCorrectness,
              totalRequests: final.totalRequests,
              correctResponses: final.correctResponses,
              failedAssertions: final.totalRequests - final.correctResponses,
            });
            setRerunning(false);
          }}
        />
      )}

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
          <div className="relative flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <Sparkles className="h-3.5 w-3.5 text-[#bc8cff]" />
              Explain in workflow context
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="border-warning/40 text-warning hover:bg-warning/10"
              onClick={() => setFixOpen((v) => !v)}
            >
              <Wrench className="h-3.5 w-3.5" /> Fix in Workflow
            </Button>

            {fixOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setFixOpen(false)}
                />
                <div className="absolute bottom-10 right-0 z-50 w-80 rounded-lg border border-border bg-surface p-3 shadow-2xl">
                  <div className="mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#bc8cff]" />
                    <span className="text-xs font-semibold">AI Suggestion</span>
                  </div>
                  <div className="space-y-2 text-2xs leading-relaxed text-text-primary/90">
                    <p>
                      <span className="font-semibold text-danger">
                        Root cause:
                      </span>{" "}
                      race condition in create_order step. Missing database
                      transaction wrapping order + items.
                    </p>
                    <p>
                      <span className="font-semibold text-accent">
                        Suggested workflow change:
                      </span>{" "}
                      Add a <span className="mono">Wait/Delay</span> node (50ms)
                      between the cart fetch and order creation to reduce the
                      concurrency collision window.
                    </p>
                    <p className="text-muted">
                      This is a workaround — the real fix is in your backend
                      code. But this will confirm the race condition is the
                      cause by reducing the failure rate.
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        addNode("wait", { x: 285, y: 690 });
                        setFixOpen(false);
                        navigate("workflow");
                      }}
                    >
                      Apply to Workflow
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setFixOpen(false);
                        navigate("workflow");
                      }}
                    >
                      Open Workflow
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFixOpen(false)}
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
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
  step: StepResult;
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
