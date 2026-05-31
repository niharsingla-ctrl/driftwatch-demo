import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import {
  Save,
  Play,
  Settings2,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { nodeTypes, type FlowNodeData } from "./workflow/FlowNode";
import { initialNodes, initialEdges, PALETTE } from "./workflow/flowData";
import { NODE_KINDS, CATEGORY_STYLE } from "./workflow/nodeStyles";
import { NodeProperties } from "./workflow/NodeProperties";
import { RunPanel } from "./workflow/RunPanel";
import { cn } from "@/lib/utils";

export function WorkflowBuilder() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedId, setSelectedId] = useState<string | null>("orders");
  const [runOpen, setRunOpen] = useState(true);
  const [runMode, setRunMode] = useState<"single" | "load">("load");

  const selectedNode = useMemo<Node<FlowNodeData> | null>(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_, n) => {
    setSelectedId(n.id);
  }, []);

  const styledNodes = useMemo(
    () => nodes.map((n) => ({ ...n, selected: n.id === selectedId })),
    [nodes, selectedId]
  );

  return (
    <div className="flex h-[calc(100vh-85px)] flex-col">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            defaultValue="Create & Verify Order"
            className="w-52 rounded-md border border-transparent bg-transparent px-1 text-sm font-semibold text-text-primary hover:border-border focus:border-accent focus:outline-none"
          />
          <button className="flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-2xs text-muted hover:text-text-primary">
            Staging <ChevronDown className="h-3 w-3" />
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="mono text-2xs text-muted">13 nodes · 14 edges</span>
          <Button variant="secondary" size="sm">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setRunOpen((v) => !v)}
          >
            <Settings2 className="h-3.5 w-3.5" /> Run settings
          </Button>
          <Button size="sm">
            <Play className="h-3.5 w-3.5" /> Run Flow
          </Button>
        </div>
      </div>

      {/* Body: palette | canvas | properties */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left palette */}
        <aside className="w-52 shrink-0 overflow-y-auto border-r border-border bg-surface">
          <div className="border-b border-border px-3 py-2">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
              Node Palette
            </p>
          </div>
          <div className="space-y-3 p-2">
            {PALETTE.map((grp) => (
              <div key={grp.group}>
                <p className="px-1 pb-1 text-2xs font-medium uppercase tracking-wide text-muted">
                  {grp.group}
                </p>
                <div className="space-y-1">
                  {grp.kinds.map((k) => {
                    const def = NODE_KINDS[k];
                    const s = CATEGORY_STYLE[def.category];
                    return (
                      <div
                        key={k}
                        draggable
                        className="flex cursor-grab items-center gap-2 rounded-md border border-border bg-bg px-2 py-1.5 text-xs transition-colors hover:border-accent/50 hover:bg-surface-2 active:cursor-grabbing"
                      >
                        <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
                        <def.Icon className={cn("h-3.5 w-3.5", s.text)} />
                        <span className="text-text-primary">{def.label}</span>
                        <GripVertical className="ml-auto h-3 w-3 text-border" />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="relative flex-1 bg-bg">
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedId(null)}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.3}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#21262d"
            />
            <Controls showInteractive={false} />
            <MiniMap
              pannable
              zoomable
              nodeColor="#30363d"
              maskColor="rgba(13,17,23,0.7)"
            />
          </ReactFlow>

          {runOpen && (
            <RunPanel
              mode={runMode}
              setMode={setRunMode}
              onClose={() => setRunOpen(false)}
            />
          )}
        </div>

        {/* Right properties panel */}
        <aside className="w-72 shrink-0 overflow-hidden border-l border-border bg-surface">
          <NodeProperties node={selectedNode} />
        </aside>
      </div>
    </div>
  );
}
