import { useCallback, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  ControlButton,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Node,
  type NodeMouseHandler,
} from "reactflow";
import {
  Save,
  Play,
  Settings2,
  ChevronDown,
  GripVertical,
  Maximize2,
  Workflow as WorkflowIcon,
  Code2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { AiFlowGenerator } from "./workflow/AiFlowGenerator";
import { nodeTypes, type FlowNodeData } from "./workflow/FlowNode";
import {
  PALETTE,
  FLOW_SCRIPT,
  generatedNodes,
  generatedEdges,
} from "./workflow/flowData";
import { NODE_KINDS, CATEGORY_STYLE } from "./workflow/nodeStyles";
import { NodeProperties } from "./workflow/NodeProperties";
import { RunPanel } from "./workflow/RunPanel";
import { RunOverlay } from "@/components/RunOverlay";
import { useStore } from "@/store/AppStore";
import { stepResults } from "@/data";
import { cn } from "@/lib/utils";

const DND_TYPE = "application/driftwatch-node";

function Inner() {
  const store = useStore();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    connect,
    addNode,
    deleteNode,
    updateNodeData,
    setGraph,
    env,
    navigate,
    setLoadRun,
  } = store;

  const [flowName, setFlowName] = useState("Create & Verify Order");
  const [selectedId, setSelectedId] = useState<string | null>("orders");
  const [runOpen, setRunOpen] = useState(true);
  const [runMode, setRunMode] = useState<"single" | "load">("load");
  const [running, setRunning] = useState(false);
  const [view, setView] = useState<"visual" | "script">("visual");
  const [aiOpen, setAiOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const acceptGeneratedFlow = () => {
    setGraph(generatedNodes, generatedEdges);
    setSelectedId("g-order");
    setView("visual");
    setAiOpen(false);
    setToast(
      "Flow generated — 8 nodes added to canvas. Review assertions before running."
    );
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 60);
    setTimeout(() => setToast(null), 6000);
  };

  const { screenToFlowPosition, fitView } = useReactFlow();
  const wrapper = useRef<HTMLDivElement>(null);

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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind = e.dataTransfer.getData(DND_TYPE);
      if (!kind) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const id = addNode(kind, position);
      setSelectedId(id);
    },
    [screenToFlowPosition, addNode]
  );

  const removeSelected = () => {
    if (selectedNode && NODE_KINDS[selectedNode.data.kind].category !== "terminal") {
      deleteNode(selectedNode.id);
      setSelectedId(null);
    }
  };

  const finishRun = (final: {
    overallCorrectness: number;
    totalRequests: number;
    correctResponses: number;
  }) => {
    setLoadRun({
      name: flowName.toLowerCase().replace(/\s+/g, "-"),
      users: runMode === "load" ? 200 : 1,
      duration: "3 min",
      environment: env,
      status: final.overallCorrectness < 99 ? "failed" : "passed",
      overallCorrectness: final.overallCorrectness,
      targetCorrectness: 99,
      totalRequests: final.totalRequests,
      correctResponses: final.correctResponses,
      failedAssertions: final.totalRequests - final.correctResponses,
      steps: stepResults,
    });
    setRunning(false);
    navigate("load");
  };

  return (
    <div className="flex h-[calc(100vh-85px)] flex-col">
      {/* Top toolbar */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="w-52 rounded-md border border-transparent bg-transparent px-1 text-sm font-semibold text-text-primary hover:border-border focus:border-accent focus:outline-none"
          />
          <span className="flex items-center gap-1 rounded-md border border-border bg-surface-2 px-2 py-0.5 text-2xs text-muted">
            {env} <ChevronDown className="h-3 w-3" />
          </span>
        </div>

        {/* Visual / Script view toggle */}
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-bg p-0.5">
          {(["visual", "script"] as const).map((v) => {
            const Icon = v === "visual" ? WorkflowIcon : Code2;
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                  view === v
                    ? "bg-surface-2 text-text-primary"
                    : "text-muted hover:text-text-primary"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {v}
                {view === v && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="mono text-2xs text-muted">
            {nodes.length} nodes · {edges.length} edges
          </span>
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
          <Button
            variant="secondary"
            size="sm"
            className="border-[#bc8cff]/40 text-[#bc8cff] hover:bg-[#bc8cff]/10"
            onClick={() => setAiOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" /> Generate with AI
          </Button>
          <Button size="sm" onClick={() => setRunning(true)}>
            <Play className="h-3.5 w-3.5" /> Run Flow
          </Button>
        </div>
      </div>

      {/* Body: palette | canvas | properties  (or full-width script editor) */}
      <div className="relative flex flex-1 overflow-hidden">
        {view === "script" ? (
          <ScriptView
            running={running}
            onRun={() => setRunning(true)}
          />
        ) : (
        <>
        {/* Left palette */}
        <aside className="w-52 shrink-0 overflow-y-auto border-r border-border bg-surface">
          <div className="border-b border-border px-3 py-2">
            <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
              Node Palette
            </p>
            <p className="mt-0.5 text-2xs text-muted">Drag onto the canvas →</p>
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
                        onDragStart={(e) => {
                          e.dataTransfer.setData(DND_TYPE, k);
                          e.dataTransfer.effectAllowed = "move";
                        }}
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
        <div className="relative flex-1 bg-bg" ref={wrapper}>
          <ReactFlow
            nodes={styledNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={connect}
            onNodeClick={onNodeClick}
            onPaneClick={() => setSelectedId(null)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            nodeTypes={nodeTypes}
            deleteKeyCode={["Backspace", "Delete"]}
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
            <Controls showInteractive={false} showFitView={false}>
              <ControlButton
                onClick={() => fitView({ padding: 0.15, duration: 400 })}
                title="Zoom to fit"
              >
                <Maximize2 />
              </ControlButton>
            </Controls>
            <MiniMap
              pannable
              zoomable
              nodeColor="#30363d"
              maskColor="rgba(13,17,23,0.7)"
            />
          </ReactFlow>

          {runOpen && !running && (
            <RunPanel
              mode={runMode}
              setMode={setRunMode}
              onRun={() => setRunning(true)}
              onClose={() => setRunOpen(false)}
            />
          )}
        </div>

        {/* Right properties panel */}
        <aside className="w-72 shrink-0 overflow-hidden border-l border-border bg-surface">
          <NodeProperties
            node={selectedNode}
            update={(patch) =>
              selectedNode && updateNodeData(selectedNode.id, patch)
            }
            onDelete={removeSelected}
          />
        </aside>
        </>
        )}

        {/* Run overlay — covers whichever view is active */}
        {running && (
          <RunOverlay
            title={flowName}
            users={runMode === "load" ? 200 : 1}
            durationLabel={runMode === "load" ? "3 min" : "single run"}
            environment={env}
            onClose={() => setRunning(false)}
            onViewResults={finishRun}
          />
        )}
      </div>

      {/* AI Flow Generator modal */}
      {aiOpen && (
        <AiFlowGenerator
          onClose={() => setAiOpen(false)}
          onAccept={acceptGeneratedFlow}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-2 rounded-lg border border-[#bc8cff]/40 bg-surface px-3 py-2.5 shadow-xl">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#bc8cff]" />
          <span className="text-xs text-text-primary">{toast}</span>
        </div>
      )}
    </div>
  );
}

/** Full-width code editor shown in the Script tab. */
function ScriptView({
  running,
  onRun,
}: {
  running: boolean;
  onRun: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col bg-bg p-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-1.5">
          <Code2 className="h-3.5 w-3.5 text-accent" />
          <span className="mono text-2xs text-text-primary">
            create-order.flow.ts
          </span>
          <span className="ml-auto text-2xs text-muted">@driftwatch/sdk</span>
        </div>
        <CodeBlock code={FLOW_SCRIPT} className="flex-1" />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-start gap-2 rounded-md border border-accent/30 bg-accent/[0.06] px-3 py-2 text-xs text-text-primary/90">
          <span>💡</span>
          <span>
            Prefer drag-and-drop? Switch to the{" "}
            <span className="font-semibold text-accent">Visual</span> tab — your
            script and canvas stay in sync automatically.
          </span>
        </div>
        <Button
          size="default"
          className="ml-auto"
          disabled={running}
          onClick={onRun}
        >
          <Play className="h-3.5 w-3.5" /> Run Flow
        </Button>
      </div>
    </div>
  );
}

export function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <Inner />
    </ReactFlowProvider>
  );
}
