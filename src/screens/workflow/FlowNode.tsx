import { Handle, Position, type NodeProps } from "reactflow";
import { NODE_KINDS, CATEGORY_STYLE } from "./nodeStyles";
import { cn } from "@/lib/utils";

export interface FlowNodeData {
  kind: keyof typeof NODE_KINDS;
  title?: string;
  lines?: string[];
}

/** Terminal Start/End nodes render as a compact pill. */
function TerminalNode({ data, selected }: NodeProps<FlowNodeData>) {
  const def = NODE_KINDS[data.kind];
  const isStart = data.kind === "start";
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-2xs font-semibold uppercase tracking-wider",
        "border-border bg-surface-2 text-muted",
        selected && "ring-1 ring-accent"
      )}
    >
      {!isStart && <Handle type="target" position={Position.Top} />}
      <def.Icon className="h-3 w-3" />
      {data.title ?? def.label}
      {isStart && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}

export function FlowNode(props: NodeProps<FlowNodeData>) {
  const { data, selected } = props;
  const def = NODE_KINDS[data.kind];
  if (!def) return null;
  if (def.category === "terminal") return <TerminalNode {...props} />;

  const s = CATEGORY_STYLE[def.category];

  return (
    <div
      className={cn(
        "w-[190px] rounded-lg border bg-surface shadow-sm transition-shadow",
        selected ? "border-accent ring-1 ring-accent" : "border-border",
        "hover:shadow-md"
      )}
    >
      <Handle type="target" position={Position.Top} />

      {/* header */}
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-t-lg border-b px-2.5 py-1.5",
          s.border,
          s.bg
        )}
      >
        <def.Icon className={cn("h-3.5 w-3.5", s.text)} />
        <span className={cn("text-2xs font-semibold uppercase tracking-wide", s.text)}>
          {def.label}
        </span>
      </div>

      {/* body */}
      <div className="px-2.5 py-2">
        {data.title && (
          <p className="mono text-xs font-medium text-text-primary">
            {data.title}
          </p>
        )}
        {data.lines?.map((l, i) => (
          <p key={i} className="mono text-2xs leading-relaxed text-muted">
            {l}
          </p>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export const nodeTypes = { flow: FlowNode };
