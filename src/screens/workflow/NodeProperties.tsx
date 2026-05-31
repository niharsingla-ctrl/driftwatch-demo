import type { Node } from "reactflow";
import { CheckCircle2, ChevronDown } from "lucide-react";
import type { FlowNodeData } from "./FlowNode";
import { NODE_KINDS, CATEGORY_STYLE } from "./nodeStyles";
import { cn } from "@/lib/utils";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1 text-2xs font-medium uppercase tracking-wide text-muted">
      {children}
    </p>
  );
}

function Select({ value }: { value: string }) {
  return (
    <button className="flex h-7 w-full items-center justify-between rounded-md border border-border bg-bg px-2 text-xs text-text-primary hover:border-accent">
      {value}
      <ChevronDown className="h-3.5 w-3.5 text-muted" />
    </button>
  );
}

const ASSERTIONS = [
  "status == 201",
  "body.id is number",
  "body.items.length > 0",
  "body.userId == {{userId}}",
  "response time < 500ms",
];

/** Full editor shown for the POST /orders API Request node (spec detail). */
function ApiRequestProps() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-1">
          <Label>Method</Label>
          <Select value="POST" />
        </div>
        <div className="col-span-2">
          <Label>URL</Label>
          <div className="flex h-7 items-center rounded-md border border-border bg-bg px-2 mono text-xs text-text-primary">
            {"{{BASE_URL}}/orders"}
          </div>
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
        <pre className="overflow-x-auto rounded-md border border-border bg-bg p-2 mono text-2xs leading-relaxed text-text-primary">
{`{
  "items": {{cart_items}},
  "userId": {{userId}}
}`}
        </pre>
      </div>

      <div>
        <Label>Extract from response</Label>
        <div className="rounded-md border border-border bg-bg p-2 mono text-2xs">
          <span className="text-[#bc8cff]">orderId</span>
          <span className="text-muted"> ← response.body.id</span>
        </div>
      </div>

      <div>
        <Label>Assertions</Label>
        <div className="space-y-1">
          {ASSERTIONS.map((a) => (
            <div
              key={a}
              className="flex items-center gap-1.5 rounded-md border border-border-muted bg-bg px-2 py-1 mono text-2xs"
            >
              <CheckCircle2 className="h-3 w-3 shrink-0 text-success" />
              <span className="text-text-primary">{a}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>On failure</Label>
        <Select value="Stop flow" />
      </div>
    </div>
  );
}

function GenericProps({ node }: { node: Node<FlowNodeData> }) {
  const def = NODE_KINDS[node.data.kind];
  return (
    <div className="space-y-3">
      {node.data.title && (
        <div>
          <Label>Name</Label>
          <div className="flex h-7 items-center rounded-md border border-border bg-bg px-2 mono text-xs text-text-primary">
            {node.data.title}
          </div>
        </div>
      )}
      {node.data.lines && node.data.lines.length > 0 && (
        <div>
          <Label>Configuration</Label>
          <div className="space-y-1 rounded-md border border-border bg-bg p-2">
            {node.data.lines.map((l, i) => (
              <p key={i} className="mono text-2xs text-muted">
                {l}
              </p>
            ))}
          </div>
        </div>
      )}
      <div>
        <Label>Node type</Label>
        <div className="flex h-7 items-center rounded-md border border-border bg-bg px-2 text-xs text-text-primary">
          {def.label}
        </div>
      </div>
    </div>
  );
}

export function NodeProperties({
  node,
}: {
  node: Node<FlowNodeData> | null;
}) {
  if (!node) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <p className="text-xs text-muted">
          Select a node on the canvas to edit its properties.
        </p>
      </div>
    );
  }

  const def = NODE_KINDS[node.data.kind];
  const s = CATEGORY_STYLE[def.category];
  const isApiRequest = node.data.kind === "apiRequest";

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
        {isApiRequest ? <ApiRequestProps /> : <GenericProps node={node} />}
      </div>
    </div>
  );
}
