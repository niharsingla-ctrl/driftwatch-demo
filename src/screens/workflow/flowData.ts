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
    method: "POST",
    url: "{{BASE_URL}}/orders",
    body: '{\n  "items": {{cart_items}},\n  "userId": {{userId}}\n}',
    assertions: [
      "status == 201",
      "body.id is number",
      "body.items.length > 0",
      "body.userId == {{userId}}",
      "response time < 500ms",
    ],
    onFailure: "Stop flow",
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

/** Flow produced by the AI Flow Generator (checkout-under-load). */
export const generatedNodes: Node<FlowNodeData>[] = [
  node("g-start", 320, 0, { kind: "start" }),
  node("g-login", 285, 90, {
    kind: "apiRequest",
    title: "POST /auth/login",
    lines: ["email, password", "→ 200 OK"],
    method: "POST",
    url: "{{BASE_URL}}/auth/login",
    assertions: ["status == 200", "body.token is string"],
    onFailure: "Stop flow",
  }),
  node("g-extract", 285, 220, {
    kind: "extract",
    title: "Extract token",
    lines: ["token → {{token}}", "userId → {{userId}}"],
  }),
  node("g-cart", 285, 350, {
    kind: "apiRequest",
    title: "POST /cart",
    lines: ["add productId 5", "Bearer {{token}}"],
    method: "POST",
    url: "{{BASE_URL}}/cart",
    assertions: ["status == 200", "body.items.length > 0"],
    onFailure: "Stop flow",
  }),
  node("g-order", 285, 480, {
    kind: "apiRequest",
    title: "POST /orders",
    lines: ["body: { items }", "Bearer {{token}}"],
    method: "POST",
    url: "{{BASE_URL}}/orders",
    assertions: [
      "status == 201",
      "body.items.length == 1",
      "body.userId == {{userId}}",
      "body.total > 0",
    ],
    onFailure: "Stop flow",
  }),
  node("g-condition", 285, 620, {
    kind: "condition",
    title: "status == 201 ?",
    lines: ["branch on response"],
  }),
  node("g-verify", 110, 760, {
    kind: "apiRequest",
    title: "GET /orders/{id}",
    lines: ["verify persisted"],
    method: "GET",
    url: "{{BASE_URL}}/orders/{{orderId}}",
    assertions: ["body.id == {{orderId}}", 'body.status == "pending"'],
    onFailure: "Continue",
  }),
  node("g-history", 110, 890, {
    kind: "apiRequest",
    title: "GET /users/{id}/orders",
    lines: ["verify in history"],
    method: "GET",
    url: "{{BASE_URL}}/users/{{userId}}/orders",
    assertions: ["response contains orderId"],
    onFailure: "Continue",
  }),
  node("g-log", 470, 760, {
    kind: "log",
    title: "Log error",
    lines: ["capture response", "+ headers"],
  }),
  node("g-cleanup", 285, 1020, {
    kind: "cleanup",
    title: "DELETE /orders/{{orderId}}",
    lines: ["always runs"],
  }),
  node("g-end", 350, 1150, { kind: "end" }),
];

export const generatedEdges: Edge[] = [
  edge("ge-start-login", "g-start", "g-login"),
  edge("ge-login-extract", "g-login", "g-extract"),
  edge("ge-extract-cart", "g-extract", "g-cart"),
  edge("ge-cart-order", "g-cart", "g-order"),
  edge("ge-order-cond", "g-order", "g-condition"),
  edge("ge-cond-verify", "g-condition", "g-verify", "YES", "#3fb950"),
  edge("ge-cond-log", "g-condition", "g-log", "NO", "#f85149"),
  edge("ge-verify-history", "g-verify", "g-history"),
  edge("ge-history-cleanup", "g-history", "g-cleanup"),
  edge("ge-log-cleanup", "g-log", "g-cleanup"),
  edge("ge-cleanup-end", "g-cleanup", "g-end"),
];

/** k6-style SDK script shown in the Workflow Builder "Script" tab. */
export const FLOW_SCRIPT = `import { flow, request, assert, extract } from "@driftwatch/sdk";

export const options = {
  vus: 200,           // virtual users
  duration: "3m",
  rampUp: "30s",
  correctnessTarget: 99,
};

export default flow("create-order", async (ctx) => {

  // Step 1: Login
  const loginRes = await request.post("/auth/login", {
    body: { email: ctx.data.email, password: ctx.data.password },
  });

  assert(loginRes.status).equals(200);
  assert(loginRes.body.token).isString();

  extract(loginRes).into({
    token: "body.token",
    userId: "body.userId",
  });

  // Step 2: Create order
  const orderRes = await request.post("/orders", {
    headers: { Authorization: \`Bearer \${ctx.vars.token}\` },
    body: {
      items: [{ productId: 5, qty: 1 }],
      userId: ctx.vars.userId,
    },
  });

  // Correctness assertions — checked on EVERY virtual user
  assert(orderRes.status).equals(201);
  assert(orderRes.body.id).isNumber();
  assert(orderRes.body.items.length).equals(1);       // catches race condition
  assert(orderRes.body.userId).equals(ctx.vars.userId); // catches token collision
  assert(orderRes.responseTime).lessThan(500);

  extract(orderRes).into({ orderId: "body.id" });

  // Step 3: Verify order persisted
  const verifyRes = await request.get(\`/orders/\${ctx.vars.orderId}\`, {
    headers: { Authorization: \`Bearer \${ctx.vars.token}\` },
  });

  assert(verifyRes.status).equals(200);
  assert(verifyRes.body.id).equals(ctx.vars.orderId);

});`;

/** Node palette grouped by category — left sidebar. */
export const PALETTE: { group: string; kinds: string[] }[] = [
  { group: "Request", kinds: ["apiRequest", "graphql"] },
  { group: "Logic", kinds: ["condition", "loop", "parallel", "wait"] },
  { group: "Data", kinds: ["extract", "setVar", "dataSource"] },
  { group: "Assertion", kinds: ["assert", "schemaCheck", "contractCheck"] },
  { group: "Utility", kinds: ["webhook", "log", "cleanup"] },
];
