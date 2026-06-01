import type {
  RecentRun,
  ContractRow,
  ComparisonRow,
  StepResult,
  SampleFailure,
  EndpointDiff,
} from "./types";

/* ────────────────────────────────────────────────────────────
   SCREEN 1 — DASHBOARD
   ──────────────────────────────────────────────────────────── */

export const healthStats = {
  apiHealth: "98.2%",
  openContracts: "3 drift warnings",
  lastRun: "4 min ago — 134/134",
};

export const recentRuns: RecentRun[] = [
  {
    id: "run-smoke",
    name: "Smoke Suite — staging",
    status: "pass",
    correctPercent: 100,
    p95: "142ms",
    triggeredBy: "PR #847",
    time: "4m ago",
  },
  {
    id: "run-create-order",
    name: "Create Order Flow × 200u",
    status: "fail",
    correctPercent: 94.1,
    p95: "340ms",
    triggeredBy: "Schedule",
    time: "1h ago",
  },
  {
    id: "run-full-regression",
    name: "Full Regression — main",
    status: "pass",
    correctPercent: 99.8,
    p95: "198ms",
    triggeredBy: "Manual",
    time: "3h ago",
  },
  {
    id: "run-auth",
    name: "Auth Flow × 50 users",
    status: "pass",
    correctPercent: 99.9,
    p95: "89ms",
    triggeredBy: "PR #841",
    time: "6h ago",
  },
];

export const contractHealth: ContractRow[] = [
  {
    endpoint: "GET /users/{id}",
    status: "clean",
    lastChecked: "2 min ago",
  },
  {
    endpoint: "POST /orders",
    status: "drift",
    lastChecked: "3 days ago",
    detail: "field 'tax' missing on orders < $10",
  },
  {
    endpoint: "GET /products",
    status: "breaking",
    lastChecked: "6 hours ago",
    detail: "field 'inventory_count' type changed integer→string",
  },
  {
    endpoint: "GET /auth/token",
    status: "clean",
    lastChecked: "2 min ago",
  },
];

export const activeComparisons: ComparisonRow[] = [
  {
    pr: "PR #847",
    branch: "feat/payment-v2",
    status: "running",
    summary: "main vs feature/payment-v2",
  },
  {
    pr: "PR #831",
    branch: "fix/user-auth",
    status: "safe",
    summary: "No behavioural changes detected",
  },
  {
    pr: "PR #829",
    branch: "feat/bulk-orders",
    status: "blocked",
    summary: "2 breaking changes found",
  },
];

/* ────────────────────────────────────────────────────────────
   SCREEN 3 — CORRECTNESS-UNDER-LOAD RESULTS
   ──────────────────────────────────────────────────────────── */

export const loadRunMeta = {
  name: "create-order-flow",
  users: 200,
  duration: "3 min",
  environment: "Staging",
  status: "failed" as const,
  overallCorrectness: 94.1,
  targetCorrectness: 99,
  totalRequests: 35982,
  correctResponses: 33864,
  failedAssertions: 2118,
};

export const stepResults: StepResult[] = [
  {
    stepId: "login",
    name: "login",
    endpoint: "POST /auth/login",
    requests: 36000,
    correct: 35982,
    wrong: 18,
    correctPercent: 99.95,
    p50: "82ms",
    p95: "145ms",
    p99: "312ms",
    failed: false,
    failures: [],
  },
  {
    stepId: "extract_token",
    name: "extract token",
    endpoint: "—",
    requests: 35982,
    correct: 35982,
    wrong: 0,
    correctPercent: 100,
    p50: "—",
    p95: "—",
    p99: "—",
    failed: false,
    failures: [],
  },
  {
    stepId: "create_order",
    name: "create_order",
    endpoint: "POST /orders",
    requests: 35982,
    correct: 34201,
    wrong: 1781,
    correctPercent: 95.05,
    p50: "198ms",
    p95: "340ms",
    p99: "891ms",
    failed: true,
    failures: [
      { expression: "body.items.length == 1", count: 1204 },
      { expression: "body.userId == {{userId}}", count: 577 },
    ],
  },
  {
    stepId: "verify_order",
    name: "verify_order",
    endpoint: "GET /orders/{id}",
    requests: 34201,
    correct: 34198,
    wrong: 3,
    correctPercent: 99.99,
    p50: "67ms",
    p95: "89ms",
    p99: "134ms",
    failed: false,
    failures: [],
  },
];

export const sampleFailures: SampleFailure[] = [
  {
    requestId: "#4,821",
    at: "00:01:34",
    sent: "POST /orders  { items: [{productId:5, qty:1}], userId: 12 }",
    expected: "body.items.length == 1",
    got: "body.items = []",
    gotNote: "empty array",
  },
  {
    requestId: "#7,103",
    at: "00:01:51",
    sent: "POST /orders  { items: [{productId:5, qty:1}], userId: 88 }",
    expected: "body.items.length == 1",
    got: "body.items = [{productId:5, qty:1}, {productId:5, qty:1}]",
    gotNote: "duplicated",
  },
];

export const loadAiAnalysis = `These failures cluster between 60–200 concurrent users and affect the items array specifically. Pattern is consistent with a race condition in cart item insertion — likely a missing database transaction or optimistic lock conflict in OrderService.create(). Failures spike at second 34–67 of the run (peak concurrency window).`;

// Correctness % over time.
// Flat near 99.8% through ramp-up (→0:34), sharp drop as concurrency peaks
// (0:34→1:07), flat ~94.1% under sustained max load, slight recovery at 3:00.
export const correctnessOverTime = [
  { t: "0:00", users: 0, correct: 99.9 },
  { t: "0:15", users: 90, correct: 99.8 },
  { t: "0:34", users: 200, correct: 99.8 },
  { t: "0:45", users: 200, correct: 97.6 },
  { t: "0:55", users: 200, correct: 95.4 },
  { t: "1:07", users: 200, correct: 94.1 },
  { t: "1:30", users: 200, correct: 94.0 },
  { t: "2:00", users: 200, correct: 94.1 },
  { t: "2:30", users: 200, correct: 94.2 },
  { t: "2:45", users: 200, correct: 94.6 },
  { t: "3:00", users: 200, correct: 95.0 },
];

// Response time distribution (long tail above 200u)
export const responseTimeDist = [
  { bucket: "0-50", count: 1420 },
  { bucket: "50-100", count: 9850 },
  { bucket: "100-150", count: 12340 },
  { bucket: "150-250", count: 7210 },
  { bucket: "250-400", count: 3180 },
  { bucket: "400-600", count: 1240 },
  { bucket: "600-900", count: 540 },
  { bucket: "900+", count: 202 },
];

// Errors by step (create_order in red)
export const errorsByStep = [
  { step: "login", assertion: 14, timeout: 4 },
  { step: "extract token", assertion: 0, timeout: 0 },
  { step: "create_order", assertion: 1697, timeout: 84 },
  { step: "verify_order", assertion: 2, timeout: 1 },
];

/* ────────────────────────────────────────────────────────────
   SCREEN 4 — DIFFERENTIAL TESTING / COMPARE
   ──────────────────────────────────────────────────────────── */

export const compareMeta = {
  baseline: "main",
  candidate: "feature/payment-v2",
  baselineEnv: "test-env-A",
  candidateEnv: "test-env-B",
  pr: "PR #847",
  opened: "12 min ago",
  breakingCount: 2,
};

export const endpointDiffs: EndpointDiff[] = [
  {
    endpoint: "/orders",
    method: "POST",
    status: "breaking",
    summary: "body.tax type: float → string",
  },
  {
    endpoint: "/users/{id}",
    method: "GET",
    status: "breaking",
    summary: "field 'phone' now required",
  },
  {
    endpoint: "/orders/{id}",
    method: "GET",
    status: "changed",
    summary: "new field 'estimated_delivery'",
  },
  {
    endpoint: "/products",
    method: "GET",
    status: "slower",
    summary: "p95: 89ms → 134ms (+50%)",
  },
  {
    endpoint: "/users",
    method: "GET",
    status: "changed",
    summary: "default page size: 20 → 25",
  },
  {
    endpoint: "/auth/login",
    method: "POST",
    status: "unchanged",
    summary: "—",
  },
  {
    endpoint: "/auth/logout",
    method: "POST",
    status: "unchanged",
    summary: "—",
  },
  {
    endpoint: "/cart",
    method: "GET",
    status: "unchanged",
    summary: "—",
  },
];

export const diffFilterCounts = {
  all: 47,
  breaking: 2,
  changed: 3,
  slower: 4,
  safe: 38,
};

export const unchangedRemaining = 39;

/** Token-level diff lines for the POST /orders selected endpoint. */
export interface DiffLine {
  baseline: string;
  candidate: string;
  state: "same" | "removed" | "added" | "changed";
  // marker shown at end of line: "breaking" | "safe" | undefined
  marker?: "breaking" | "safe";
}

export const orderDiffLines: DiffLine[] = [
  { baseline: "{", candidate: "{", state: "same" },
  { baseline: '  "id": 1,', candidate: '  "id": 1,', state: "same" },
  {
    baseline: '  "status": "pending",',
    candidate: '  "status": "pending",',
    state: "same",
  },
  {
    baseline: '  "total": 99.99,',
    candidate: '  "total": 99.99,',
    state: "same",
  },
  {
    baseline: '  "tax": 8.50,',
    candidate: '  "tax": "8.50",',
    state: "changed",
    marker: "breaking",
  },
  { baseline: "", candidate: "", state: "same" },
  {
    baseline: '  "items": [...],',
    candidate: '  "items": [...],',
    state: "same",
  },
  {
    baseline: '  "created_at": "..."',
    candidate: '  "created_at": "...",',
    state: "same",
  },
  {
    baseline: "",
    candidate: '  "est_delivery": "..."',
    state: "added",
    marker: "safe",
  },
  { baseline: "}", candidate: "}", state: "same" },
];

export const orderDiffChanges = [
  {
    severity: "breaking" as const,
    field: "body.tax",
    detail: "type changed: number(8.50) → string(\"8.50\")",
    note: "Consumers reading .tax as number will break",
  },
  {
    severity: "safe" as const,
    field: "body.est_delivery",
    detail: "new optional field added",
    note: "Additive — existing consumers unaffected",
  },
];

export const orderImpact = {
  testedAcross: "50 sample requests",
  consistency: "All showed same diff",
  reproducible: "100% reproducible",
  references: [
    "2 test assertions in \"Checkout Flow\" workflow",
    "OpenAPI spec: /orders POST response schema",
    "1 other endpoint: GET /orders/{id} (same issue)",
  ],
};

/** Compact diff detail for endpoints other than POST /orders. */
export interface CompareDetail {
  changes: {
    severity: "breaking" | "safe" | "warning";
    field: string;
    detail: string;
    note: string;
  }[];
  before: string;
  after: string;
  impact: string[];
}

export const compareDetails: Record<string, CompareDetail> = {
  "GET /users/{id}": {
    changes: [
      {
        severity: "breaking",
        field: "body.phone",
        detail: "now required (was optional)",
        note: "Requests/consumers omitting phone will receive 422",
      },
    ],
    before: '{\n  "id": 5,\n  "name": "Ada",\n  "phone": null\n}',
    after: '{\n  "id": 5,\n  "name": "Ada",\n  "phone": "+1-555-0100"  // required\n}',
    impact: [
      "3 test assertions in \"User Profile\" suite",
      "OpenAPI spec: /users/{id} response schema",
    ],
  },
  "GET /orders/{id}": {
    changes: [
      {
        severity: "safe",
        field: "body.estimated_delivery",
        detail: "new optional field added",
        note: "Additive — existing consumers unaffected",
      },
    ],
    before: '{\n  "id": 1,\n  "status": "shipped"\n}',
    after:
      '{\n  "id": 1,\n  "status": "shipped",\n  "estimated_delivery": "2026-06-03"\n}',
    impact: ["Surfaced in \"Order Tracking\" workflow (optional read)"],
  },
  "GET /products": {
    changes: [
      {
        severity: "warning",
        field: "p95 latency",
        detail: "89ms → 134ms (+50%)",
        note: "No schema change — response shape identical",
      },
    ],
    before: "p50: 41ms\np95: 89ms\np99: 142ms",
    after: "p50: 58ms\np95: 134ms   // +50%\np99: 233ms",
    impact: [
      "Within SLA (200ms) but trending up",
      "Likely N+1 query introduced in product listing",
    ],
  },
  "GET /users": {
    changes: [
      {
        severity: "warning",
        field: "pagination.default_page_size",
        detail: "20 → 25",
        note: "Clients hard-coding 20 will see different page boundaries",
      },
    ],
    before: '{\n  "page": 1,\n  "page_size": 20,\n  "items": [ /* 20 */ ]\n}',
    after: '{\n  "page": 1,\n  "page_size": 25,\n  "items": [ /* 25 */ ]\n}',
    impact: ["2 snapshot assertions expecting 20 items will fail"],
  },
};

export const prComment = {
  pr: "PR #847",
  baseline: "main",
  candidate: "feature/payment-v2",
  breaking: [
    { method: "POST", endpoint: "/orders", note: "body.tax type: float → string" },
    {
      method: "GET",
      endpoint: "/users/{id}",
      note: "field 'phone' now required",
    },
  ],
  behavioural: [
    {
      method: "GET",
      endpoint: "/orders/{id}",
      note: "new field 'estimated_delivery'",
    },
    { method: "GET", endpoint: "/products", note: "p95 response 50% slower" },
    {
      method: "GET",
      endpoint: "/users",
      note: "pagination default changed 20→25",
    },
  ],
  unchanged: 42,
  link: "flowtest.app/compare/pr-847",
};
