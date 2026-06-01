import { useEffect } from "react";
import { X, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSimulation } from "@/hooks/useSimulation";
import { cn } from "@/lib/utils";

export interface RunOverlayProps {
  title: string;
  users: number;
  durationLabel: string;
  environment: string;
  fixed?: boolean;
  ctaLabel?: string;
  onClose: () => void;
  onViewResults: (final: {
    overallCorrectness: number;
    totalRequests: number;
    correctResponses: number;
  }) => void;
}

const LOGS = [
  { at: 0.02, text: "→ ramping up virtual users (0 → target)…" },
  { at: 0.12, text: "POST /auth/login — 100% correct" },
  { at: 0.22, text: "Extract token → {{tok}} ok" },
  { at: 0.34, text: "⚠ create_order correctness dropping at 60+ concurrent users" },
  { at: 0.48, text: "❌ assert fail: body.items.length == 1 (×1,204)" },
  { at: 0.6, text: "❌ assert fail: body.userId == {{userId}} (×577)" },
  { at: 0.78, text: "concurrency easing — correctness recovering" },
  { at: 0.95, text: "finalising report…" },
];

export function RunOverlay(props: RunOverlayProps) {
  const sim = useSimulation();

  useEffect(() => {
    sim.start({ logs: LOGS });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pct = Math.round(sim.progress * 100);
  const done = sim.status === "done";

  return (
    <div
      className={cn(
        "z-20 flex items-center justify-center bg-bg/70 backdrop-blur-sm",
        props.fixed ? "fixed inset-0 z-50" : "absolute inset-0"
      )}
    >
      <div className="w-[480px] rounded-xl border border-border bg-surface shadow-2xl">
        {/* header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          {done ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
          )}
          <div>
            <p className="text-sm font-semibold">
              {done ? "Run complete" : "Running load test…"}
            </p>
            <p className="mono text-2xs text-muted">
              {props.title} · {props.users} users · {props.durationLabel} ·{" "}
              {props.environment}
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="ml-auto text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* live counters */}
        <div className="grid grid-cols-3 divide-x divide-border border-b border-border">
          <Counter
            label="Requests"
            value={sim.requests.toLocaleString()}
            tone="default"
          />
          <Counter
            label="Correctness"
            value={`${sim.correctness.toFixed(1)}%`}
            tone={sim.correctness < 99 ? "danger" : "success"}
          />
          <Counter label="Elapsed" value={`${sim.elapsedSec}s`} tone="default" />
        </div>

        {/* progress bar */}
        <div className="px-4 pt-3">
          <div className="mb-1 flex items-center justify-between text-2xs text-muted">
            <span>Progress</span>
            <span className="mono">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-100",
                done && sim.correctness < 99 ? "bg-danger" : "bg-accent"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* streaming log */}
        <div className="m-4 h-40 overflow-y-auto rounded-md border border-border bg-bg p-3 mono text-2xs leading-relaxed">
          {sim.log.length === 0 && (
            <p className="text-muted">Waiting for first results…</p>
          )}
          {sim.log.map((l, i) => (
            <p
              key={i}
              className={cn(
                l.startsWith("❌")
                  ? "text-danger"
                  : l.startsWith("⚠")
                  ? "text-warning"
                  : "text-muted"
              )}
            >
              {l}
            </p>
          ))}
        </div>

        {/* footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button variant="ghost" size="sm" onClick={props.onClose}>
            Close
          </Button>
          <Button
            size="sm"
            disabled={!done}
            onClick={() =>
              props.onViewResults({
                overallCorrectness: Number(sim.correctness.toFixed(1)),
                totalRequests: sim.requests,
                correctResponses: sim.correct,
              })
            }
          >
            {props.ctaLabel ?? "View full results"}{" "}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "success" | "danger";
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-2xs uppercase tracking-wide text-muted">{label}</p>
      <p
        className={cn(
          "mono text-lg font-bold",
          tone === "danger"
            ? "text-danger"
            : tone === "success"
            ? "text-success"
            : "text-text-primary"
        )}
      >
        {value}
      </p>
    </div>
  );
}
