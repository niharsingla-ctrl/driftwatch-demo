import { Card } from "@/components/ui/card";
import { orderDiffLines, orderDiffChanges, orderImpact } from "@/data";
import { XCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

function lineBg(state: string, side: "baseline" | "candidate") {
  if (state === "changed") return "bg-danger/[0.12]";
  if (state === "added" && side === "candidate") return "bg-success/[0.12]";
  if (state === "removed" && side === "baseline") return "bg-danger/[0.12]";
  return "";
}

function Marker({ marker }: { marker?: "breaking" | "safe" }) {
  if (marker === "breaking")
    return <XCircle className="h-3 w-3 shrink-0 text-danger" />;
  if (marker === "safe")
    return <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />;
  return <span className="w-3 shrink-0" />;
}

function DiffColumn({
  title,
  subtitle,
  side,
}: {
  title: string;
  subtitle: string;
  side: "baseline" | "candidate";
}) {
  return (
    <div className="flex-1 overflow-hidden">
      <div className="border-b border-border bg-surface-2 px-3 py-1.5">
        <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
          {title}
        </p>
        <p className="mono text-2xs text-text-primary">{subtitle}</p>
      </div>
      <div className="bg-bg py-1.5">
        {orderDiffLines.map((l, i) => {
          const text = side === "baseline" ? l.baseline : l.candidate;
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2 px-3 mono text-2xs leading-5",
                lineBg(l.state, side)
              )}
            >
              <span className="w-5 select-none text-right text-border">
                {text ? i + 1 : ""}
              </span>
              <span
                className={cn(
                  "flex-1 whitespace-pre",
                  l.state === "changed" && "text-danger",
                  l.state === "added" && side === "candidate" && "text-success",
                  !text && "text-border"
                )}
              >
                {text || " "}
              </span>
              <Marker marker={text ? l.marker : undefined} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DiffViewer() {
  return (
    <Card>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="mono text-sm font-semibold">POST /orders</span>
          <span className="inline-flex items-center gap-1 rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-2xs font-medium text-danger">
            <XCircle className="h-3 w-3" /> BREAKING CHANGE
          </span>
        </div>
      </div>

      {/* Side-by-side diff */}
      <div className="flex divide-x divide-border border-b border-border">
        <DiffColumn
          title="Baseline (main)"
          subtitle="main"
          side="baseline"
        />
        <DiffColumn
          title="Candidate (feature branch)"
          subtitle="feature/payment-v2"
          side="candidate"
        />
      </div>

      {/* Changes list */}
      <div className="space-y-2 border-b border-border p-4">
        <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
          Changes
        </p>
        {orderDiffChanges.map((c) => (
          <div key={c.field} className="flex items-start gap-2">
            {c.severity === "breaking" ? (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-danger/30 bg-danger/10 px-1.5 py-0.5 text-2xs font-semibold text-danger">
                <XCircle className="h-3 w-3" /> BREAKING
              </span>
            ) : (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded border border-success/30 bg-success/10 px-1.5 py-0.5 text-2xs font-semibold text-success">
                <CheckCircle2 className="h-3 w-3" /> SAFE
              </span>
            )}
            <div className="min-w-0">
              <p className="text-xs text-text-primary">
                <span className="mono text-accent">{c.field}</span>{" "}
                <span className="text-muted">{c.detail}</span>
              </p>
              <p className="text-2xs text-muted">{c.note}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reproducibility */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2.5 text-2xs text-muted">
        <span>
          Tested across:{" "}
          <span className="text-text-primary">{orderImpact.testedAcross}</span>
        </span>
        <span className="text-border">|</span>
        <span>{orderImpact.consistency}</span>
        <span className="text-border">|</span>
        <span className="text-success">{orderImpact.reproducible}</span>
      </div>

      {/* Impact analysis */}
      <div className="p-4">
        <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted">
          Impact analysis — this field is referenced in:
        </p>
        <ul className="space-y-1.5">
          {orderImpact.references.map((r) => (
            <li
              key={r}
              className="flex items-start gap-2 text-xs text-text-primary"
            >
              <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
