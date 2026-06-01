import { useState } from "react";
import {
  LayoutDashboard,
  FolderTree,
  Workflow,
  Gauge,
  GitCompareArrows,
  Search,
  ChevronDown,
  Bell,
  Server,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, type ScreenId, type Env } from "@/store/AppStore";

const NAV: { id: ScreenId; label: string; Icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "collections", label: "Collections", Icon: FolderTree },
  { id: "workflow", label: "Workflow Builder", Icon: Workflow },
  { id: "load", label: "Correctness-Under-Load", Icon: Gauge },
  { id: "compare", label: "Compare", Icon: GitCompareArrows },
];

const ENVS: { value: Env; color: string }[] = [
  { value: "Development", color: "bg-muted" },
  { value: "Staging", color: "bg-accent" },
  { value: "Production", color: "bg-danger" },
];

function EnvSwitcher() {
  const { env, setEnv } = useStore();
  const [open, setOpen] = useState(false);
  const current = ENVS.find((e) => e.value === env)!;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2.5 py-1 text-xs text-text-primary hover:bg-[#262c36]"
      >
        <Server className="h-3.5 w-3.5 text-muted" />
        <span className={cn("h-2 w-2 rounded-full", current.color)} />
        {env}
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-9 z-50 w-44 rounded-md border border-border bg-surface p-1 shadow-xl">
            <p className="px-2 py-1 text-2xs uppercase tracking-wide text-muted">
              Environment
            </p>
            {ENVS.map((e) => (
              <button
                key={e.value}
                onClick={() => {
                  setEnv(e.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-text-primary hover:bg-surface-2"
              >
                <span className={cn("h-2 w-2 rounded-full", e.color)} />
                {e.value}
                {env === e.value && (
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

export function TopNav() {
  const { screen, navigate, search, setSearch } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
      {/* Row 1 — brand, workspace, search, user */}
      <div className="flex h-12 items-center gap-3 px-4">
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

        <EnvSwitcher />

        <div className="relative ml-auto hidden w-72 md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search runs, endpoints…"
            className="h-8 w-full rounded-md border border-border bg-bg pl-8 pr-8 text-xs text-text-primary placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {search ? (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-2 px-1.5 py-0.5 text-2xs text-muted">
              ⌘K
            </kbd>
          )}
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
            onClick={() => navigate(id)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors",
              screen === id
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
