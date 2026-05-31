import { Play, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-xs text-muted">{label}</label>
      {children}
    </div>
  );
}

function Input({ value }: { value: string }) {
  return (
    <input
      defaultValue={value}
      className="h-7 w-36 rounded-md border border-border bg-bg px-2 text-xs text-text-primary focus:border-accent focus:outline-none"
    />
  );
}

function Select({ value }: { value: string }) {
  return (
    <button className="flex h-7 w-36 items-center justify-between rounded-md border border-border bg-bg px-2 text-xs text-text-primary hover:border-accent">
      {value}
      <ChevronDown className="h-3.5 w-3.5 text-muted" />
    </button>
  );
}

export function RunPanel({
  mode,
  setMode,
  onClose,
}: {
  mode: "single" | "load";
  setMode: (m: "single" | "load") => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 w-72 rounded-lg border border-border bg-surface shadow-xl">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-semibold">Run Configuration</span>
        <button
          onClick={onClose}
          className="text-muted hover:text-text-primary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-3 p-3">
        <div>
          <p className="mb-1.5 text-2xs uppercase tracking-wide text-muted">
            Run Mode
          </p>
          <div className="space-y-1.5">
            {(["single", "load"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex w-full items-center gap-2 text-left text-xs"
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
                    mode === m ? "border-accent" : "border-border"
                  )}
                >
                  {mode === m && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  )}
                </span>
                <span
                  className={cn(
                    mode === m ? "text-text-primary" : "text-muted"
                  )}
                >
                  {m === "single"
                    ? "Single run (1 user)"
                    : "Load test (concurrent users)"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {mode === "load" && (
          <div className="space-y-2 border-t border-border-muted pt-3">
            <Field label="Concurrent users">
              <Input value="200" />
            </Field>
            <Field label="Duration">
              <Input value="3 minutes" />
            </Field>
            <Field label="Ramp up">
              <Input value="30 seconds" />
            </Field>
            <Field label="Data source">
              <Select value="users.csv" />
            </Field>
            <p className="text-right text-2xs text-muted">
              1,000 unique users
            </p>
          </div>
        )}

        <div className="border-t border-border-muted pt-3">
          <Field label="Environment">
            <Select value="Staging" />
          </Field>
        </div>

        <Button className="w-full" size="lg">
          <Play className="h-4 w-4" /> Run Flow
        </Button>
      </div>
    </div>
  );
}
