import {
  LayoutDashboard,
  Workflow,
  Gauge,
  GitCompareArrows,
  Search,
  ChevronDown,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScreenId } from "@/App";

const NAV: { id: ScreenId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "workflow", label: "Workflow Builder", Icon: Workflow },
  { id: "load", label: "Correctness-Under-Load", Icon: Gauge },
  { id: "compare", label: "Compare", Icon: GitCompareArrows },
];

export function TopNav({
  active,
  onNavigate,
}: {
  active: ScreenId;
  onNavigate: (id: ScreenId) => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      {/* Row 1 — brand, workspace, search, user */}
      <div className="flex h-12 items-center gap-4 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-accent to-success">
            <svg viewBox="0 0 32 32" className="h-4 w-4">
              <path
                d="M6 20c3-6 5-6 8 0s5 6 8 0"
                stroke="#0d1117"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Driftwatch
          </span>
        </div>

        <button className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs text-text-primary hover:bg-[#262c36]">
          <span className="h-3.5 w-3.5 rounded-sm bg-accent/80" />
          acme-commerce
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        </button>

        <div className="relative ml-auto hidden w-72 md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            placeholder="Search requests, runs, endpoints…"
            className="h-8 w-full rounded-md border border-border bg-bg pl-8 pr-12 text-xs text-text-primary placeholder:text-muted focus:border-accent focus:outline-none"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-2xs text-muted">
            ⌘K
          </kbd>
        </div>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#bc8cff] to-accent text-2xs font-bold text-[#0d1117]">
          NS
        </div>
      </div>

      {/* Row 2 — screen navigation */}
      <nav className="flex items-center gap-1 px-3">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              active === id
                ? "border-accent text-text-primary"
                : "border-transparent text-muted hover:text-text-primary"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
