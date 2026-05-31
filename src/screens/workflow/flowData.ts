import type { Node, Edge } from "reactflow";
import { MarkerType } from "reactflow";
import type { FlowNodeData } from "./FlowNode";

const node = (
  id: string,
  x: number,
  y: number,
  data: FlowNodeData
): Node<FlowNodeData> => ({
  id,
  type: "flow",
  position: { x, y },
  data,
});

export const initialNodes: Node<FlowNodeData>[] = [
  node("start", 320, 0, { kind: "start" }),
  node("login", 285, 90, {
    kind: "apiRequest",
    title: "POST /auth/login",
    lines: ["email, password", "→ 200 OK"],
  }),
  node("extract", 285, 230, {
    kind: "extract",
    title: "Extract",
    lines: ["token → {{tok}}", "userId → {{uid}}"],
  }),
  node("parallel", 290, 370, {
    kind: "parallel",
    lines: ["run both branches", "simultaneously"],
  }),
  node("cart", 120, 500, {
    kind: "apiRequest",
    title: "GET /cart",
    lines: ["Authorization: {{tok}}"],
  }),
  node("products", 470, 500, {
    kind: "apiRequest",
    title: "GET /products",
    lines: ["Authorization: {{tok}}"],
  }),
  node("join", 290, 630, {
    kind: "join",
    title: "Join",
    lines: ["await both branches"],
  }),
  node("orders", 285, 760, {
    kind: "apiRequest",
    title: "POST /orders",
    lines: ["body: { items }", "Bearer {{tok}}"],
  }),
  node("condition", 285, 900, {
    kind: "condition",
    title: "status == 201 ?",
    lines: ["branch on response"],
  }),
  node("assertOk", 110, 1050, {
    kind: "assert",
    title: "Assert",
    lines: ["body check", "items.length > 0"],
  }),
  node("assertErr", 470, 1050, {
    kind: "log",
    title: "Log error",
    lines: ["capture response", "+ headers"],
  }),
  node("cleanup", 285, 1200, {
    kind: "cleanup",
    title: "DELETE /orders/{{orderId}}",
    lines: ["always runs"],
  }),
  node("end", 350, 1330, { kind: "end" }),
];

const edge = (
  id: string,
  source: string,
  target: string,
  label?: string,
  color?: string
): Edge => ({
  id,
  source,
  target,
  label,
  type: "smoothstep",
  animated: false,
  markerEnd: { type: MarkerType.ArrowClosed, color: color ?? "#484f58" },
  style: { stroke: color ?? "#484f58", strokeWidth: 1.5 },
  labelStyle: { fill: "#e6edf3", fontSize: 10, fontWeight: 600 },
  labelBgStyle: { fill: "#161b22", fillOpacity: 0.95 },
  labelBgPadding: [4, 2],
  labelBgBorderRadius: 4,
});

export const initialEdges: Edge[] = [
  edge("e-start-login", "start", "login"),
  edge("e-login-extract", "login", "extract"),
  edge("e-extract-parallel", "extract", "parallel"),
  edge("e-parallel-cart", "parallel", "cart"),
  edge("e-parallel-products", "parallel", "products"),
  edge("e-cart-join", "cart", "join"),
  edge("e-products-join", "products", "join"),
  edge("e-join-orders", "join", "orders"),
  edge("e-orders-condition", "orders", "condition"),
  edge("e-cond-ok", "condition", "assertOk", "YES", "#3fb950"),
  edge("e-cond-err", "condition", "assertErr", "NO", "#f85149"),
  edge("e-ok-cleanup", "assertOk", "cleanup"),
  edge("e-err-cleanup", "assertErr", "cleanup"),
  edge("e-cleanup-end", "cleanup", "end"),
];

/** Node palette grouped by category — left sidebar. */
export const PALETTE: { group: string; kinds: string[] }[] = [
  { group: "Request", kinds: ["apiRequest", "graphql"] },
  { group: "Logic", kinds: ["condition", "loop", "parallel", "wait"] },
  { group: "Data", kinds: ["extract", "setVar", "dataSource"] },
  { group: "Assertion", kinds: ["assert", "schemaCheck", "contractCheck"] },
  { group: "Utility", kinds: ["webhook", "log", "cleanup"] },
];
