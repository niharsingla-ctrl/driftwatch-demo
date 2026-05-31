import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CircleDot,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusKind =
  | "pass"
  | "fail"
  | "drift"
  | "breaking"
  | "warning"
  | "clean"
  | "running"
  | "safe"
  | "changed"
  | "slower"
  | "blocked";

const MAP: Record<
  StatusKind,
  { label: string; color: string; Icon: typeof CheckCircle2; spin?: boolean }
> = {
  pass: { label: "Pass", color: "text-success", Icon: CheckCircle2 },
  clean: { label: "Clean", color: "text-success", Icon: CheckCircle2 },
  safe: { label: "Safe", color: "text-success", Icon: CheckCircle2 },
  fail: { label: "Fail", color: "text-danger", Icon: XCircle },
  breaking: { label: "Breaking", color: "text-danger", Icon: XCircle },
  blocked: { label: "Blocked", color: "text-danger", Icon: XCircle },
  drift: { label: "Drift", color: "text-warning", Icon: AlertTriangle },
  warning: { label: "Warning", color: "text-warning", Icon: AlertTriangle },
  changed: { label: "Changed", color: "text-warning", Icon: AlertTriangle },
  slower: { label: "Slower", color: "text-warning", Icon: AlertTriangle },
  running: { label: "Running", color: "text-accent", Icon: Loader2, spin: true },
};

export function StatusPill({
  kind,
  label,
  className,
  iconOnly,
}: {
  kind: StatusKind;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const m = MAP[kind] ?? {
    label: kind,
    color: "text-muted",
    Icon: CircleDot,
  };
  const Icon = m.Icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        m.color,
        className
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", m.spin && "animate-spin")} />
      {!iconOnly && (label ?? m.label)}
    </span>
  );
}
