import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "reactflow";
import type { FlowNodeData } from "@/screens/workflow/FlowNode";
import { initialNodes, initialEdges } from "@/screens/workflow/flowData";
import {
  recentRuns as seedRuns,
  loadRunMeta,
  stepResults,
} from "@/data";
import type { RecentRun, StepResult } from "@/data/types";

export type ScreenId =
  | "dashboard"
  | "collections"
  | "workflow"
  | "load"
  | "compare";
export type Env = "Development" | "Staging" | "Production";

export interface LoadRun {
  name: string;
  users: number;
  duration: string;
  environment: string;
  status: "passed" | "failed";
  overallCorrectness: number;
  targetCorrectness: number;
  totalRequests: number;
  correctResponses: number;
  failedAssertions: number;
  steps: StepResult[];
}

const defaultLoadRun: LoadRun = {
  ...loadRunMeta,
  status: "failed",
  steps: stepResults,
};

interface Store {
  // navigation
  screen: ScreenId;
  navigate: (s: ScreenId) => void;

  // global controls
  env: Env;
  setEnv: (e: Env) => void;
  search: string;
  setSearch: (s: string) => void;

  // dashboard runs
  runs: RecentRun[];
  addRun: (run: Omit<RecentRun, "id">) => string;
  deleteRun: (id: string) => void;
  renameRun: (id: string, name: string) => void;
  updateRun: (id: string, patch: Partial<RecentRun>) => void;

  // workflow graph
  nodes: Node<FlowNodeData>[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  connect: (c: Connection) => void;
  addNode: (kind: string, position: { x: number; y: number }) => string;
  deleteNode: (id: string) => void;
  updateNodeData: (id: string, patch: Partial<FlowNodeData>) => void;
  setGraph: (nodes: Node<FlowNodeData>[], edges: Edge[]) => void;

  // load results
  loadRun: LoadRun;
  setLoadRun: (r: LoadRun) => void;
  setLoadTarget: (n: number) => void;
}

const Ctx = createContext<Store | null>(null);

let idCounter = 1;
const nextId = (prefix: string) => `${prefix}-${idCounter++}`;

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<ScreenId>("dashboard");
  const [env, setEnv] = useState<Env>("Staging");
  const [search, setSearch] = useState("");

  const [runs, setRuns] = useState<RecentRun[]>(seedRuns);
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [loadRun, setLoadRun] = useState<LoadRun>(defaultLoadRun);

  const value = useMemo<Store>(
    () => ({
      screen,
      navigate: setScreen,
      env,
      setEnv,
      search,
      setSearch,

      runs,
      addRun: (run) => {
        const id = nextId("run");
        setRuns((prev) => [{ id, ...run }, ...prev]);
        return id;
      },
      deleteRun: (id) => setRuns((prev) => prev.filter((r) => r.id !== id)),
      renameRun: (id, name) =>
        setRuns((prev) =>
          prev.map((r) => (r.id === id ? { ...r, name } : r))
        ),
      updateRun: (id, patch) =>
        setRuns((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...patch } : r))
        ),

      nodes,
      edges,
      onNodesChange: (changes) =>
        setNodes((nds) => applyNodeChanges(changes, nds)),
      onEdgesChange: (changes) =>
        setEdges((eds) => applyEdgeChanges(changes, eds)),
      connect: (c) =>
        setEdges((eds) =>
          rfAddEdge(
            {
              ...c,
              type: "smoothstep",
              markerEnd: { type: MarkerType.ArrowClosed, color: "#484f58" },
              style: { stroke: "#484f58", strokeWidth: 1.5 },
            },
            eds
          )
        ),
      addNode: (kind, position) => {
        const id = nextId("node");
        setNodes((nds) => [
          ...nds,
          {
            id,
            type: "flow",
            position,
            data: { kind: kind as FlowNodeData["kind"] },
          },
        ]);
        return id;
      },
      deleteNode: (id) => {
        setNodes((nds) => nds.filter((n) => n.id !== id));
        setEdges((eds) =>
          eds.filter((e) => e.source !== id && e.target !== id)
        );
      },
      updateNodeData: (id, patch) =>
        setNodes((nds) =>
          nds.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
          )
        ),
      setGraph: (newNodes, newEdges) => {
        setNodes(newNodes);
        setEdges(newEdges);
      },

      loadRun,
      setLoadRun,
      setLoadTarget: (n) =>
        setLoadRun((r) => ({ ...r, targetCorrectness: n })),
    }),
    [screen, env, search, runs, nodes, edges, loadRun]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used within AppStoreProvider");
  return ctx;
}
