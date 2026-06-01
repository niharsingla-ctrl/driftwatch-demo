import { useEffect, useState } from "react";
import {
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  Circle,
  ChevronDown,
  AlertTriangle,
  Check,
  Pencil,
  Lock,
  ShoppingCart,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Mode = "input" | "generating" | "result";

const EXAMPLES: Record<string, { label: string; Icon: typeof Lock; text: string }> =
  {
    auth: {
      label: "Auth flow",
      Icon: Lock,
      text: "Test that a user can register, log in, fetch their profile with the returned token, then log out. Assert the token is valid and the profile matches. Run with 50 users.",
    },
    checkout: {
      label: "Checkout flow",
      Icon: ShoppingCart,
      text: "Test the full checkout: log in as a user, add a product to cart, create an order, verify the order is created correctly with the right total and items, then clean up by cancelling the order. Test under 200 concurrent users and assert correctness stays above 99%.",
    },
    crud: {
      label: "User CRUD",
      Icon: User,
      text: "Test the full user lifecycle: create a user, fetch it by id, update the email, fetch again to confirm the change, then delete it and confirm a 404. Run with 25 users.",
    },
  };

const GEN_STEPS = [
  "Reading OpenAPI spec — found 47 endpoints",
  "Understanding test intent — checkout flow with load",
  "Building workflow nodes...",
  "Writing assertions",
  "Configuring load settings",
];

const STREAM = [
  "> Identified 6 steps: login → add_to_cart → create_order → verify_order → verify_history → cleanup",
  "> Adding parallel validation for cart + product availability",
  "> Generating correctness assertions for each step...",
  "> Detecting potential race conditions in order creation...",
  "> Setting concurrency to 200 users based on your request...",
].join("\n");

interface GenAssertion {
  step: string;
  expr: string;
  note?: string;
}
const ASSERTIONS: GenAssertion[] = [
  { step: "login", expr: "status == 200" },
  { step: "login", expr: "body.token is string" },
  { step: "add_to_cart", expr: "status == 200" },
  { step: "add_to_cart", expr: "body.items.length > 0" },
  { step: "create_order", expr: "status == 201" },
  {
    step: "create_order",
    expr: "body.items.length == 1",
    note: "race condition risk under load — this assertion will catch concurrent write conflicts",
  },
  {
    step: "create_order",
    expr: "body.userId == {{userId}}",
    note: "token collision detection — critical under load",
  },
  { step: "create_order", expr: "body.total > 0" },
  { step: "verify_order", expr: "body.id == {{orderId}}" },
  { step: "verify_order", expr: 'body.status == "pending"' },
  { step: "verify_history", expr: "response contains orderId" },
  { step: "cleanup", expr: "status == 200 or 204" },
];

const SUMMARY: { label: string; value: string }[] = [
  { label: "Steps", value: "8 nodes" },
  { label: "Assertions", value: "12 total (2 per key step)" },
  { label: "Load settings", value: "200 concurrent users, 3 min, 30s ramp" },
  { label: "Data source", value: "Requires: email, password, productId" },
  { label: "Edge cases", value: "Empty cart check, expired token retry" },
  { label: "Cleanup", value: "DELETE /orders/{{orderId}} on all paths" },
];

export function AiFlowGenerator({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) {
  const [mode, setMode] = useState<Mode>("input");
  const [prompt, setPrompt] = useState("");
  const [spec, setSpec] = useState("ecommerce-api-v2.yaml");
  const [environment, setEnvironment] = useState("Staging");
  const [opts, setOpts] = useState({ load: true, edge: true, cleanup: true });

  // generation animation state
  const [completed, setCompleted] = useState(0);
  const [typed, setTyped] = useState("");

  // disabled assertions (by index)
  const [disabled, setDisabled] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDisabled((s) => {
      const n = new Set(s);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });

  useEffect(() => {
    if (mode !== "generating") return;
    setCompleted(0);
    setTyped("");
    const stepTimers = [400, 900, 1500, 2100, 2600].map((t, i) =>
      setTimeout(() => setCompleted(i + 1), t)
    );
    let i = 0;
    const typer = setInterval(() => {
      i += 2;
      setTyped(STREAM.slice(0, i));
      if (i >= STREAM.length) clearInterval(typer);
    }, 16);
    const done = setTimeout(() => setMode("result"), 2900);
    return () => {
      stepTimers.forEach(clearTimeout);
      clearInterval(typer);
      clearTimeout(done);
    };
  }, [mode]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg/80 p-6 backdrop-blur-sm">
      <div className="my-auto w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#bc8cff]/15">
            <Sparkles className="h-4 w-4 text-[#bc8cff]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">AI Flow Generator</h2>
            <p className="text-xs text-muted">
              Describe what you want to test in plain English. AI will build the
              workflow, assertions, and load settings for you.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {mode === "input" && (
          <InputSection
            prompt={prompt}
            setPrompt={setPrompt}
            spec={spec}
            setSpec={setSpec}
            environment={environment}
            setEnvironment={setEnvironment}
            opts={opts}
            setOpts={setOpts}
            onGenerate={() => setMode("generating")}
          />
        )}

        {mode === "generating" && (
          <div className="space-y-4 p-5">
            <div className="space-y-2.5">
              {GEN_STEPS.map((label, i) => {
                const state =
                  i < completed ? "done" : i === completed ? "running" : "pending";
                return (
                  <div key={label} className="flex items-center gap-2.5 text-sm">
                    {state === "done" && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    )}
                    {state === "running" && (
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-accent" />
                    )}
                    {state === "pending" && (
                      <Circle className="h-4 w-4 shrink-0 text-border" />
                    )}
                    <span
                      className={cn(
                        state === "pending" ? "text-muted" : "text-text-primary"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <pre className="h-40 overflow-y-auto whitespace-pre-wrap rounded-md border border-border bg-[#0b0f15] p-3 mono text-2xs leading-relaxed text-success">
              {typed}
              <span className="animate-pulse text-text-primary">▋</span>
            </pre>
          </div>
        )}

        {mode === "result" && (
          <ResultSection
            disabled={disabled}
            toggle={toggle}
            onClose={onClose}
            onAccept={onAccept}
          />
        )}
      </div>
    </div>
  );
}

/* ── Input ─────────────────────────────────────────────────── */
function InputSection({
  prompt,
  setPrompt,
  spec,
  setSpec,
  environment,
  setEnvironment,
  opts,
  setOpts,
  onGenerate,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
  spec: string;
  setSpec: (v: string) => void;
  environment: string;
  setEnvironment: (v: string) => void;
  opts: { load: boolean; edge: boolean; cleanup: boolean };
  setOpts: (v: { load: boolean; edge: boolean; cleanup: boolean }) => void;
  onGenerate: () => void;
}) {
  return (
    <div className="space-y-4 p-5">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-text-primary">
          What do you want to test?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="e.g. Test that a user can register, log in, create an order with 2 items, and verify the order appears in their order history. Run it under load with 100 users."
          className="w-full resize-y rounded-md border border-border bg-bg p-3 text-xs text-text-primary placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(EXAMPLES).map(([key, ex]) => (
            <button
              key={key}
              onClick={() => setPrompt(ex.text)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-bg px-3 py-1 text-xs text-text-primary transition-colors hover:border-accent/50 hover:bg-surface-2"
            >
              <ex.Icon className="h-3.5 w-3.5 text-muted" />
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-2xs uppercase tracking-wide text-muted">
            OpenAPI Spec
          </label>
          <MiniSelect
            value={spec}
            options={[
              "ecommerce-api-v2.yaml",
              "ecommerce-api-v1.yaml",
              "payments-api.yaml",
            ]}
            onChange={setSpec}
          />
        </div>
        <div>
          <label className="mb-1 block text-2xs uppercase tracking-wide text-muted">
            Environment
          </label>
          <MiniSelect
            value={environment}
            options={["Development", "Staging", "Production"]}
            onChange={setEnvironment}
          />
        </div>
      </div>

      <div className="space-y-2">
        <CheckRow
          checked={opts.load}
          onChange={(v) => setOpts({ ...opts, load: v })}
          label="Include load testing settings"
        />
        <CheckRow
          checked={opts.edge}
          onChange={(v) => setOpts({ ...opts, edge: v })}
          label="Generate edge case assertions"
        />
        <CheckRow
          checked={opts.cleanup}
          onChange={(v) => setOpts({ ...opts, cleanup: v })}
          label="Add cleanup steps automatically"
        />
      </div>

      <Button className="w-full" size="lg" onClick={onGenerate}>
        <Sparkles className="h-4 w-4" /> Generate Flow
      </Button>
    </div>
  );
}

/* ── Result ────────────────────────────────────────────────── */
function ResultSection({
  disabled,
  toggle,
  onClose,
  onAccept,
}: {
  disabled: Set<number>;
  toggle: (i: number) => void;
  onClose: () => void;
  onAccept: () => void;
}) {
  return (
    <>
      <div className="max-h-[60vh] overflow-y-auto p-5">
        <div className="mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <h3 className="text-sm font-semibold">
            Flow generated — 8 nodes, 12 assertions
          </h3>
        </div>

        <MiniFlow />

        {/* Summary */}
        <div className="mt-4">
          <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted">
            Generated flow summary
          </p>
          <div className="overflow-hidden rounded-md border border-border">
            {SUMMARY.map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "flex gap-3 px-3 py-1.5 text-xs",
                  i !== SUMMARY.length - 1 && "border-b border-border-muted"
                )}
              >
                <span className="w-28 shrink-0 text-muted">{s.label}</span>
                <span className="text-text-primary">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Assertions checklist */}
        <div className="mt-4">
          <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted">
            Review generated assertions ({ASSERTIONS.length} total)
          </p>
          <div className="space-y-1">
            {ASSERTIONS.map((a, i) => {
              const off = disabled.has(i);
              return (
                <div
                  key={i}
                  className={cn(
                    "rounded-md border bg-bg px-2.5 py-1.5",
                    a.note
                      ? "border-border border-l-2 border-l-warning"
                      : "border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(i)}
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        off
                          ? "border-border bg-transparent"
                          : "border-success bg-success/20"
                      )}
                    >
                      {!off && <Check className="h-3 w-3 text-success" />}
                    </button>
                    <span
                      className={cn(
                        "mono text-2xs",
                        off ? "text-muted line-through" : "text-muted"
                      )}
                    >
                      {a.step}
                    </span>
                    <span
                      className={cn(
                        "mono text-xs",
                        off ? "text-muted line-through" : "text-text-primary"
                      )}
                    >
                      {a.expr}
                    </span>
                  </div>
                  {a.note && (
                    <p className="mt-1 flex items-start gap-1.5 pl-6 text-2xs text-warning">
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                      AI note: “{a.note}”
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        <Button variant="secondary" size="default" onClick={onClose}>
          <Pencil className="h-3.5 w-3.5" /> Edit before importing
        </Button>
        <Button size="default" onClick={onAccept}>
          <CheckCircle2 className="h-3.5 w-3.5" /> Add to Canvas
        </Button>
      </div>
    </>
  );
}

/* ── Mini flow preview ─────────────────────────────────────── */
function Chip({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "accent" | "purple" | "amber" | "teal" | "success" | "danger";
}) {
  const tones: Record<string, string> = {
    default: "border-border bg-surface-2 text-muted",
    accent: "border-accent/40 bg-accent/10 text-accent",
    purple: "border-[#bc8cff]/40 bg-[#bc8cff]/10 text-[#bc8cff]",
    amber: "border-warning/40 bg-warning/10 text-warning",
    teal: "border-[#39c5cf]/40 bg-[#39c5cf]/10 text-[#39c5cf]",
    success: "border-success/40 bg-success/10 text-success",
    danger: "border-danger/40 bg-danger/10 text-danger",
  };
  return (
    <span
      className={cn(
        "rounded-md border px-2 py-1 mono text-2xs font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}

const Arrow = () => <span className="text-border">↓</span>;

function MiniFlow() {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-bg p-4">
      <Chip>START</Chip>
      <Arrow />
      <Chip tone="accent">LOGIN</Chip>
      <Arrow />
      <Chip tone="purple">EXTRACT TOKEN</Chip>
      <Arrow />
      <Chip tone="accent">ADD TO CART</Chip>
      <Arrow />
      <Chip tone="accent">CREATE ORDER</Chip>
      <Arrow />
      <Chip tone="amber">CONDITION: 201?</Chip>
      <div className="flex items-start gap-10 pt-1">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-2xs font-semibold text-success">YES</span>
          <Chip tone="success">VERIFY ORDER</Chip>
          <Arrow />
          <Chip tone="success">VERIFY HISTORY</Chip>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-2xs font-semibold text-danger">NO</span>
          <Chip tone="danger">LOG ERROR</Chip>
        </div>
      </div>
      <Arrow />
      <Chip tone="teal">CLEANUP</Chip>
      <Arrow />
      <Chip>END</Chip>
    </div>
  );
}

/* ── Small controls ────────────────────────────────────────── */
function CheckRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-2 text-left text-xs text-text-primary"
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded border",
          checked ? "border-accent bg-accent/20" : "border-border"
        )}
      >
        {checked && <Check className="h-3 w-3 text-accent" />}
      </span>
      {label}
    </button>
  );
}

function MiniSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-full items-center justify-between gap-1.5 rounded-md border border-border bg-bg px-2.5 mono text-xs text-text-primary hover:border-accent"
      >
        <span className="truncate">{value}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-50 w-full overflow-hidden rounded-md border border-border bg-surface p-1 shadow-xl">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left mono text-xs hover:bg-surface-2",
                  o === value ? "text-accent" : "text-text-primary"
                )}
              >
                {o}
                {o === value && <Check className="ml-auto h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
