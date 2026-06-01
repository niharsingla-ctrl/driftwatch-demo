import { useState } from "react";
import type { Node } from "reactflow";
import { CheckCircle2, ChevronDown, Plus, Trash2, X } from "lucide-react";
import type { FlowNodeData } from "./FlowNode";
import { NODE_KINDS, CATEGORY_STYLE } from "./nodeStyles";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ON_FAILURE = ["Stop flow", "Continue", "Retry (3×)", "Mark flaky"];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-2xs font-medium uppercase tracking-wide text-muted">
      {children}
    </p>
  );
}

function Dropdown({
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
        className="flex h-7 w-full items-center justify-between rounded-md border border-border bg-bg px-2 text-xs text-text-primary hover:border-accent"
      >
        {value}
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-50 w-full rounded-md border border-border bg-surface p-1 shadow-xl">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={cn(
                  "block w-full rounded px-2 py-1 text-left text-xs hover:bg-surface-2",
                  o === value ? "text-accent" : "text-text-primary"
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ApiRequestProps({
  node,
  update,
}: {
  node: Node<FlowNodeData>;
  update: (patch: Partial<FlowNodeData>) => void;
}) {
  const d = node.data;
  const assertions = d.assertions ?? [];

  const setAssertion = (i: number, v: string) =>
    update({ assertions: assertions.map((a, idx) => (idx === i ? v : a)) });
  const removeAssertion = (i: number) =>
    update({ assertions: assertions.filter((_, idx) => idx !== i) });
  const addAssertion = () =>
    update({ assertions: [...assertions, "new.field is value"] });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Label>Method</Label>
          <Dropdown
            value={d.method ?? "GET"}
            options={METHODS}
            onChange={(method) => update({ method })}
          />
        </div>
        <div className="col-span-2">
          <Label>URL</Label>
          <input
            value={d.url ?? ""}
            onChange={(e) => update({ url: e.target.value })}
            className="h-7 w-full rounded-md border border-border bg-bg px-2 mono text-xs text-text-primary focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <Label>Headers</Label>
        <div className="rounded-md border border-border bg-bg p-2 mono text-2xs leading-relaxed">
          <div>
            <span className="text-accent">Authorization</span>: Bearer{" "}
            <span className="text-[#bc8cff]">{"{{token}}"}</span>
          </div>
          <div>
            <span className="text-accent">Content-Type</span>: application/json
          </div>
        </div>
      </div>

      <div>
        <Label>Body</Label>
        <textarea
          value={d.body ?? ""}
          onChange={(e) => update({ body: e.target.value })}
          rows={4}
          spellCheck={false}
          className="w-full resize-y rounded-md border border-border bg-bg p-2 mono text-2xs leading-relaxed text-text-primary focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label>Assertions ({assertions.length})</Label>
          <button
            onClick={addAssertion}
            className="flex items-center gap-0.5 text-2xs text-accent hover:underline"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
        <div className="space-y-1">
          {assertions.map((a, i) => (
            <div key={i} className="group flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
              <input
                value={a}
                onChange={(e) => setAssertion(i, e.target.value)}
                className="h-6 flex-1 rounded border border-border-muted bg-bg px-1.5 mono text-2xs text-text-primary focus:border-accent focus:outline-none"
              />
              <button
                onClick={() => removeAssertion(i)}
                className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {assertions.length === 0 && (
            <p className="text-2xs text-muted">No assertions — add one.</p>
          )}
        </div>
      </div>

      <div>
        <Label>On failure</Label>
        <Dropdown
          value={d.onFailure ?? "Stop flow"}
          options={ON_FAILURE}
          onChange={(onFailure) => update({ onFailure })}
        />
      </div>
    </div>
  );
}

function GenericProps({
  node,
  update,
}: {
  node: Node<FlowNodeData>;
  update: (patch: Partial<FlowNodeData>) => void;
}) {
  const def = NODE_KINDS[node.data.kind];
  return (
    <div className="space-y-3">
      <div>
        <Label>Label</Label>
        <input
          value={node.data.title ?? def.label}
          onChange={(e) => update({ title: e.target.value })}
          className="h-7 w-full rounded-md border border-border bg-bg px-2 mono text-xs text-text-primary focus:border-accent focus:outline-none"
        />
      </div>
      {node.data.lines && node.data.lines.length > 0 && (
        <div>
          <Label>Configuration</Label>
          <textarea
            value={node.data.lines.join("\n")}
            onChange={(e) =>
              update({ lines: e.target.value.split("\n") })
            }
            rows={Math.max(2, node.data.lines.length)}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-border bg-bg p-2 mono text-2xs text-text-primary focus:border-accent focus:outline-none"
          />
        </div>
      )}
      <div>
        <Label>Node type</Label>
        <div className="flex h-7 items-center rounded-md border border-border bg-bg px-2 text-xs text-muted">
          {def.label}
        </div>
      </div>
    </div>
  );
}

export function NodeProperties({
  node,
  update,
  onDelete,
}: {
  node: Node<FlowNodeData> | null;
  update: (patch: Partial<FlowNodeData>) => void;
  onDelete: () => void;
}) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xs text-muted">
          Select a node to edit its properties, or drag one from the palette
          onto the canvas.
        </p>
      </div>
    );
  }

  const def = NODE_KINDS[node.data.kind];
  const s = CATEGORY_STYLE[def.category];
  const isApiRequest = node.data.kind === "apiRequest";
  const isTerminal = def.category === "terminal";

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md",
            s.bg,
            s.text
          )}
        >
          <def.Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xs uppercase tracking-wide text-muted">Node</p>
          <p className="text-sm font-semibold">{def.label}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isApiRequest ? (
          <ApiRequestProps node={node} update={update} />
        ) : (
          <GenericProps node={node} update={update} />
        )}
      </div>

      {!isTerminal && (
        <div className="border-t border-border p-3">
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-danger hover:bg-danger/10"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete node
          </Button>
        </div>
      )}
    </div>
  );
}
