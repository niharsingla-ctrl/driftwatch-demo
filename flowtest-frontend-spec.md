# FlowTest — Complete Product Feature Spec
### For Frontend / UI Design Reference
---

## CONTEXT FOR THE DESIGNER

This document describes **FlowTest**, an advanced API testing platform targeting QA engineers and backend developers. Think of it as the intersection of three tools that don't currently exist as one:

1. **Postman** — API client with collections, environments, assertions
2. **Locust** — Load/performance testing with concurrent virtual users
3. **Chromatic/Percy** — Before/after comparison testing, but for APIs instead of UI screenshots

The product has **three genuinely unique features** no competitor has:
- **Correctness-Under-Load** — run test flows with 200 concurrent users and validate that responses are still *correct*, not just fast
- **Differential Testing** — compare API behaviour between two branches/versions side by side before merging
- **Zero-setup Contract Testing** — import OpenAPI spec, instantly get drift detection and breaking change alerts on every test run

The target user is a **QA engineer or backend developer** at a 10–200 person company. The UI should feel like a modern developer tool — dark mode first, dense but clean, similar in energy to Linear, Vercel Dashboard, or Raycast. Not enterprise-heavy. Not playful/consumer. Professional, fast, and data-dense.

---

## PRODUCT STRUCTURE — Main Navigation

```
FlowTest
├── Dashboard              (home, overview of recent runs & health)
├── Collections            (API request library)
├── Workflows              (visual test flow builder)
├── Test Suites            (organize & run test suites)
├── Compare                (differential testing — branch vs branch)
├── Contracts              (OpenAPI spec management & drift monitoring)
├── Environments           (env variable management)
├── CI/CD                  (integration setup & run history)
└── Settings               (workspace, team, integrations)
```

---

## SCREEN 1 — Dashboard

**Purpose:** First thing a user sees. Shows overall API health, recent activity, and quick actions.

### Layout
- Top: workspace selector + global search bar + user avatar
- Left: main navigation sidebar (collapsible)
- Main area: 3-column grid of cards

### Content Blocks

**Health Overview (top row — 3 stat cards):**
```
[ API Health: 98.2% ]   [ Open Contracts: 3 drift warnings ]   [ Last Run: 4 min ago — 134/134 ✅ ]
```

**Recent Test Runs (table):**
```
Run Name                    Status    Correct%   p95      Triggered By    Time
────────────────────────────────────────────────────────────────────────────────
Smoke Suite — staging       ✅ Pass   100%       142ms    PR #847         4m ago
Create Order Flow × 200u    ❌ Fail   94.1%      340ms    Schedule        1h ago
Full Regression — main      ✅ Pass   99.8%      198ms    Manual          3h ago
Auth Flow × 50 users        ✅ Pass   99.9%      89ms     PR #841         6h ago
```

**Contract Health (panel):**
```
Endpoint                      Status         Last checked
─────────────────────────────────────────────────────────
GET /users/{id}               ✅ Clean       2 min ago
POST /orders                  🟡 Drift       3 days ago
  └ field 'tax' missing on orders < $10
GET /products                 🔴 Breaking    6 hours ago
  └ field 'inventory_count' type changed integer→string
GET /auth/token               ✅ Clean       2 min ago
```

**Active Comparisons (panel):**
```
PR #847 — feat/payment-v2    Running...    main vs feature/payment-v2
PR #831 — fix/user-auth      ✅ Safe       No behavioural changes detected
PR #829 — feat/bulk-orders   ❌ Blocked    2 breaking changes found
```

**Quick Actions (button row):**
```
[ + New Collection ]  [ ▶ Run Suite ]  [ ↑ Import OpenAPI Spec ]  [ + New Workflow ]
```

---

## SCREEN 2 — Collections (API Request Library)

**Purpose:** Organize and manage all API endpoints. Similar to Postman collections but cleaner.

### Layout
- Left panel: folder tree (Collections → Folders → Requests)
- Right panel: request editor (method, URL, headers, body, assertions)
- Bottom panel: response viewer

### Left Panel — Collection Tree
```
▼ 📁 E-commerce API
  ▼ 📁 Auth
      POST /auth/login
      POST /auth/logout
      POST /auth/refresh
      GET  /auth/me
  ▼ 📁 Users
      GET  /users
      GET  /users/{id}
      POST /users
      PUT  /users/{id}
      DELETE /users/{id}
  ▼ 📁 Orders
      GET  /orders
      GET  /orders/{id}
      POST /orders
      PATCH /orders/{id}/status
  ▼ 📁 Products
      GET  /products
      GET  /products/{id}
      POST /products
```

### Right Panel — Request Editor

**Top bar:**
```
[ POST ▼ ]  [ {{BASE_URL}}/auth/login          ]  [ Send ▶ ]  [ Save ]
```

**Tabs below:**
```
[ Params ] [ Headers ] [ Body ] [ Auth ] [ Pre-script ] [ Assertions ] [ Examples ]
```

**Body tab (active):**
```json
{
  "email": "{{test_user_email}}",
  "password": "{{test_user_password}}"
}
```

**Assertions tab — THIS IS UNIQUE (visual assertion builder):**
```
+ Add Assertion

┌─────────────────────────────────────────────────────────────────┐
│  status code    [ is ]           [ 200          ]        🗑      │
├─────────────────────────────────────────────────────────────────┤
│  body.token     [ is string ]                            🗑      │
├─────────────────────────────────────────────────────────────────┤
│  body.userId    [ is number ]                            🗑      │
├─────────────────────────────────────────────────────────────────┤
│  response time  [ less than ]    [ 500ms        ]        🗑      │
└─────────────────────────────────────────────────────────────────┘

  Extract variables:
  ┌──────────────┬─────────────────────┐
  │ token        │ response.body.token │
  │ userId       │ response.body.userId│
  └──────────────┴─────────────────────┘
```

**Bottom panel — Response:**
```
Status: 200 OK    Time: 87ms    Size: 312 B

[ Body ] [ Headers ] [ Contract Check ] [ Timeline ]

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 5,
  "expiresAt": "2026-06-01T12:00:00Z"
}

Contract Check: ✅ Response matches OpenAPI spec
  All required fields present
  All types correct
```

---

## SCREEN 3 — Visual Workflow Builder ⭐ (Key Differentiator)

**Purpose:** Drag-and-drop canvas to build multi-step test flows with logic, branching, and assertions. No code required.

### Layout
- Top toolbar: flow name, save, run button, load settings panel
- Left sidebar: node palette (draggable node types)
- Main canvas: infinite canvas with nodes and connecting edges
- Right sidebar: selected node properties panel

### Node Types (left sidebar palette)

```
REQUEST NODES
  [ API Request ]      — make an HTTP call
  [ GraphQL Query ]    — GraphQL operation

LOGIC NODES
  [ Condition ]        — if/else branch based on response value
  [ Loop ]             — repeat N times or until condition
  [ Parallel ]         — run multiple branches simultaneously
  [ Wait/Delay ]       — pause between steps

DATA NODES
  [ Extract Variable ] — pull a value from a response
  [ Set Variable ]     — manually set a variable
  [ Data Source ]      — inject from CSV/JSON test data file

ASSERTION NODES
  [ Assert ]           — validate a value, fail flow if wrong
  [ Schema Check ]     — validate response against JSON schema
  [ Contract Check ]   — validate against OpenAPI spec

UTILITY NODES
  [ Webhook Listener ] — wait for an incoming webhook
  [ Log ]              — log a value to test output
  [ Cleanup ]          — always runs, even if flow fails
```

### Canvas — Example Flow (Create & Verify Order)

```
                    ┌─────────────────┐
                    │   START         │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  API Request    │
                    │  POST /auth     │
                    │  login          │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Extract         │
                    │ token → {{tok}} │
                    │ userId → {{uid}}│
                    └────────┬────────┘
                             │
              ┌──────────────▼──────────────┐
              │       Parallel              │
              │  (run both simultaneously)  │
              └──────┬───────────────┬──────┘
                     │               │
          ┌──────────▼──┐     ┌──────▼──────────┐
          │ API Request │     │  API Request    │
          │ GET /cart   │     │  GET /products  │
          └──────┬──────┘     └──────┬──────────┘
                 │                   │
              ┌──▼───────────────────▼──┐
              │         JOIN            │
              └──────────┬──────────────┘
                         │
                ┌────────▼────────┐
                │  API Request    │
                │  POST /orders   │
                │  body: {items}  │
                └────────┬────────┘
                         │
                ┌────────▼────────┐
                │   Condition     │
                │  status == 201? │
                └──┬──────────┬───┘
                   │YES       │NO
          ┌────────▼──┐   ┌───▼────────┐
          │  Assert   │   │   Assert   │
          │ body check│   │ Log error  │
          └────────┬──┘   └───┬────────┘
                   │          │
                   └────┬─────┘
                        │
               ┌────────▼────────┐
               │    Cleanup      │
               │ DELETE /orders/ │
               │   {{orderId}}   │
               └────────┬────────┘
                        │
                    ┌───▼───┐
                    │  END  │
                    └───────┘
```

### Right Panel — Node Properties (when API Request node selected)

```
Node: API Request
──────────────────────────────────────
Method:   [ POST ▼ ]
URL:      [ {{BASE_URL}}/orders ]

Headers:
  Authorization: Bearer {{token}}
  Content-Type:  application/json

Body:
  {
    "items": {{cart_items}},
    "userId": {{userId}}
  }

Extract from response:
  orderId   ←  response.body.id

Assertions:
  ✅ status == 201
  ✅ body.id is number
  ✅ body.items.length > 0
  ✅ body.userId == {{userId}}
  ✅ response time < 500ms

On failure:  [ Stop flow ▼ ]
```

### Run Panel (top right)

```
Run Mode:
  ○ Single run (1 user)
  ● Load test (concurrent users)

Concurrent users:  [ 200        ]
Duration:          [ 3 minutes  ]
Ramp up:           [ 30 seconds ]
Data source:       [ users.csv  ▼ ] (1,000 unique users)

Environment:       [ Staging    ▼ ]

[ ▶ Run Flow ]
```

---

## SCREEN 4 — Correctness-Under-Load Results ⭐ (Key Differentiator)

**Purpose:** Show real-time and final results of running a flow under concurrent load. Both performance AND correctness in one view.

### Layout
- Top: run metadata + summary verdict
- Middle: per-step breakdown table
- Bottom: failure details + charts

### Top Summary
```
Run: create-order-flow   |   200 users   |   3 min   |   Staging   |   ❌ FAILED

Overall Correctness:  94.1%   (target: 99%)
Total Requests:       35,982
Correct Responses:    33,864
Failed Assertions:    2,118
```

### Per-Step Table
```
Step              Requests  Correct   Wrong   Correct%    p50    p95    p99
──────────────────────────────────────────────────────────────────────────────
login             36,000    35,982       18    99.95%     82ms  145ms  312ms
extract token     35,982    35,982        0   100.00%      —      —      —
create_order      35,982    34,201    1,781    95.05% ❌  198ms  340ms  891ms
  └ assert fail: body.items.length == 1   (1,204 times)
  └ assert fail: body.userId == {{userId}} (577 times)
verify_order      34,201    34,198        3    99.99%     67ms   89ms  134ms

Click any row to see individual failed responses
```

### Failure Detail Panel (expandable)
```
Failure: body.items.length == 1   —  1,204 occurrences

Sample failures (click to expand):

  Request #4,821  at 00:01:34
  ──────────────────────────────────────────────
  Sent:     POST /orders  { items: [{productId:5, qty:1}], userId: 12 }
  Expected: body.items.length == 1
  Got:      body.items = []     ← empty array

  Request #7,103  at 00:01:51
  ──────────────────────────────────────────────
  Sent:     POST /orders  { items: [{productId:5, qty:1}], userId: 88 }
  Expected: body.items.length == 1
  Got:      body.items = [{productId:5, qty:1}, {productId:5, qty:1}]  ← duplicated

AI Analysis:
  ┌────────────────────────────────────────────────────────────────┐
  │ These failures cluster between 60–200 concurrent users and     │
  │ affect the items array specifically. Pattern is consistent     │
  │ with a race condition in cart item insertion — likely a        │
  │ missing database transaction or optimistic lock conflict in    │
  │ OrderService.create(). Failures spike at second 34–67 of the  │
  │ run (peak concurrency window).                                 │
  └────────────────────────────────────────────────────────────────┘
```

### Charts Row
```
[ Correctness % over time ]    [ Response time distribution ]    [ Errors by step ]
  line chart, x=time             histogram p50/p95/p99             stacked bar
  drops at ~60 concurrent        shows long tail above 200u        create_order in red
```

---

## SCREEN 5 — Differential Testing (Compare) ⭐ (Key Differentiator)

**Purpose:** Compare API behaviour between two branches/environments side by side. The "Chromatic for APIs" screen.

### Layout
- Top: comparison setup (baseline vs candidate)
- Middle: endpoint-by-endpoint diff table
- Bottom: detailed diff viewer for selected endpoint

### Top — Comparison Setup
```
Compare:
  Baseline:    [ main              ▼ ]   Environment: [ test-env-A ▼ ]
  Candidate:   [ feature/payment-v2 ▼ ]  Environment: [ test-env-B ▼ ]

Test suite:  [ Full Regression ▼ ]     [ ▶ Run Comparison ]

─── OR ───

  Auto-running on PR #847 (opened 12 min ago)
```

### Middle — Diff Summary
```
Comparison: main vs feature/payment-v2   |   PR #847   |   ❌ 2 breaking changes

Filter: [ All (47) ] [ Breaking (2) ] [ Changed (3) ] [ Slower (4) ] [ Safe (38) ]

Endpoint              Method   Status          Change Summary
────────────────────────────────────────────────────────────────────────────────────
/orders               POST     ❌ BREAKING     body.tax type: float → string
/users/{id}           GET      ❌ BREAKING     field 'phone' now required
/orders/{id}          GET      ⚠️  CHANGED     new field 'estimated_delivery'
/products             GET      ⚠️  SLOWER      p95: 89ms → 134ms (+50%)
/users                GET      ⚠️  CHANGED     default page size: 20 → 25
/auth/login           POST     ✅ UNCHANGED    —
/auth/logout          POST     ✅ UNCHANGED    —
/cart                 GET      ✅ UNCHANGED    —
... 39 more unchanged endpoints
```

### Bottom — Endpoint Diff Viewer (POST /orders selected)

```
POST /orders  —  BREAKING CHANGE

┌─────────────────────────────┬─────────────────────────────┐
│  BASELINE (main)            │  CANDIDATE (feature branch) │
├─────────────────────────────┼─────────────────────────────┤
│  {                          │  {                          │
│    "id": 1,                 │    "id": 1,                 │
│    "status": "pending",     │    "status": "pending",     │
│    "total": 99.99,          │    "total": 99.99,          │
│    "tax": 8.50,         ❌  │    "tax": "8.50",       ❌  │
│                             │                             │
│    "items": [...],          │    "items": [...],          │
│    "created_at": "..."      │    "created_at": "...",     │
│                             │    "est_delivery": "..." ✅ │
│  }                          │  }                          │
└─────────────────────────────┴─────────────────────────────┘

Changes:
  ❌ BREAKING   body.tax     type changed: number(8.50) → string("8.50")
                             Consumers reading .tax as number will break
  ✅ SAFE       body.est_delivery  new optional field added
                             Additive — existing consumers unaffected

Tested across: 50 sample requests  |  All showed same diff  |  100% reproducible

Impact analysis:
  This field is referenced in:
  → 2 test assertions in "Checkout Flow" workflow
  → OpenAPI spec: /orders POST response schema
  → 1 other endpoint: GET /orders/{id} (same issue)
```

### PR Comment Preview (shown in UI for GitHub integration)
```
FlowTest Differential Report — PR #847
────────────────────────────────────────────────────────────
Baseline: main  →  Candidate: feature/payment-v2

❌ 2 BREAKING CHANGES (merge blocked)
  POST /orders       body.tax type: float → string
  GET  /users/{id}   field 'phone' now required

⚠️  3 BEHAVIOURAL CHANGES (safe, review recommended)
  GET  /orders/{id}  new field 'estimated_delivery'
  GET  /products     p95 response 50% slower
  GET  /users        pagination default changed 20→25

✅ 42 ENDPOINTS UNCHANGED

🔗 Full report → flowtest.app/compare/pr-847
────────────────────────────────────────────────────────────
```

---

## SCREEN 6 — Contract Testing Dashboard ⭐ (Key Differentiator)

**Purpose:** Upload OpenAPI spec, see live contract health, breaking change alerts, and spec drift over time.

### Layout
- Top: spec file selector + last validated time
- Left: endpoint list with health status
- Right: selected endpoint contract detail

### Top Bar
```
OpenAPI Spec:  [ ecommerce-api-v2.yaml ▼ ]   Last validated: 2 min ago
[ ↑ Update Spec ]  [ Run Validation Now ]  [ View Spec Diff ]
```

### Left Panel — Endpoint Health List
```
Filter: [ All ] [ Drifting ] [ Breaking ] [ Clean ]

GET    /users              ✅ Clean
GET    /users/{id}         ✅ Clean
POST   /users              ✅ Clean
PUT    /users/{id}         ✅ Clean
DELETE /users/{id}         ✅ Clean
GET    /orders             ✅ Clean
GET    /orders/{id}        ✅ Clean
POST   /orders             🟡 Drift     ← selected
PATCH  /orders/{id}/status ✅ Clean
GET    /products           🔴 Breaking
POST   /products           ✅ Clean
GET    /auth/login         ✅ Clean
POST   /auth/refresh       ✅ Clean
```

### Right Panel — POST /orders Contract Detail

```
POST /orders  —  🟡 Drift Detected

Spec says response must include:
  Required fields:  id, status, total, tax, items, created_at
  tax type:         number (float)
  items type:       array of OrderItem objects

Live response (last 500 runs):
  ┌─────────────────────────────────────────────────────────┐
  │  Field        Expected      Actual           Match%     │
  │  ──────────────────────────────────────────────────     │
  │  id           number        number           100% ✅    │
  │  status       string        string           100% ✅    │
  │  total        number        number           100% ✅    │
  │  tax          number        number            88% ⚠️    │
  │               ↑ missing on 12% of responses             │
  │               (orders where total < $10)                │
  │  items        array         array            100% ✅    │
  │  created_at   datetime str  datetime str     100% ✅    │
  └─────────────────────────────────────────────────────────┘

Drift history:
  May 28 — first detected (after deploy v2.3.1)
  May 29 — 11% of responses affected
  May 30 — 12% of responses affected
  May 31 — 12% of responses affected (today)

Condition: tax field missing when order total < $10.00
Pattern: consistent, not flaky — deterministic bug

[ Create GitHub Issue ]  [ Add to Test Suite ]  [ Dismiss ]
```

### Breaking Change Alert (GET /products — 🔴)
```
GET /products  —  🔴 Breaking Change  (6 hours ago)

Field 'inventory_count' type changed:
  Was:  integer   (e.g., 142)
  Now:  string    (e.g., "142")

First seen: today at 08:32 AM (after deploy v2.3.2)
Frequency:  100% of responses affected
Reproducible: yes, deterministic

Downstream impact:
  → "Product Availability" workflow uses .inventory_count > 0
    This assertion will now always FAIL (string > 0 = false in strict mode)
  → OpenAPI spec violation on every single response

[ Create P1 Alert ]  [ View in Workflow ]  [ Mark as Known ]
```

---

## SCREEN 7 — Test Suites & Run Management

**Purpose:** Organize test runs, view history, track regressions over time.

### Layout
- Left: suite list
- Right: suite detail + run history

### Left Panel
```
Test Suites

  ⚡ Smoke Tests           (12 tests)
  🔁 Full Regression       (134 tests)
  🔐 Auth Flows            (28 tests)
  🛒 Checkout Flows        (19 tests)
  📦 Order Management      (41 tests)
  🔥 Load: Create Order    (1 flow, 200u)
  🔥 Load: Auth Stress     (1 flow, 500u)

[ + New Suite ]
```

### Right Panel — Full Regression suite

```
Full Regression Suite  |  134 tests

[ ▶ Run Now ]  [ Schedule ]  [ Edit ]

Run History:
Run #    Date          Environment   Status      Correct%   Duration
──────────────────────────────────────────────────────────────────────
#1041   Today 09:15    Staging       ✅ 134/134  100%       4m 12s
#1040   Today 06:00    Staging       ✅ 134/134  100%       4m 08s
#1039   Yesterday      Production    ✅ 133/134  99.3%      4m 31s
          └ 1 failure: GET /products — inventory_count type mismatch
#1038   2 days ago     Staging       ✅ 134/134  100%       3m 58s
#1037   2 days ago     Production    ✅ 134/134  100%       4m 02s
#1036   3 days ago     Staging       ❌ 129/134  96.3%      4m 44s
          └ 5 failures: POST /orders — tax field missing on small orders

Regression Tracker (last 30 days):
[Visual timeline — green/red dots per run per day, showing which tests are flaky]

Flaky Tests Detected:
  GET /products/search    — failed 3/47 times this week (6.4% flake rate)
  POST /auth/refresh      — failed 1/47 times this week (2.1% flake rate)
```

---

## SCREEN 8 — Environment Management

**Purpose:** Manage variables across environments cleanly.

### Layout — Side-by-side environment editor

```
Environments

[ + New Environment ]

┌─────────────────┬───────────────────┬─────────────────────┬──────────────┐
│ Variable        │ Development       │ Staging             │ Production   │
├─────────────────┼───────────────────┼─────────────────────┼──────────────┤
│ BASE_URL        │ http://localhost  │ https://api.stg.com │ https://api  │
│ API_KEY         │ dev-key-123       │ stg-key-456         │ ●●●●●●●●     │
│ DB_TIMEOUT      │ 5000              │ 5000                │ 3000         │
│ RATE_LIMIT      │ 1000/min          │ 500/min             │ 100/min      │
│ test_user_email │ dev@test.com      │ stg@test.com        │ (not set) ⚠️ │
└─────────────────┴───────────────────┴─────────────────────┴──────────────┘

Secret variables are masked. Click to reveal (requires re-auth).
⚠️  test_user_email not set in Production — 3 tests will fail if run there.
```

---

## SCREEN 9 — CI/CD Integration

**Purpose:** Show setup instructions, active integrations, and run history from CI.

### Layout

**Integration Setup Cards:**
```
┌───────────────────────────────────────────────────┐
│  GitHub Actions                          ✅ Active │
│                                                    │
│  Auto-runs on: pull_request, push to main          │
│  Last triggered: 4 min ago (PR #847)               │
│  [ View Config ]  [ Regenerate Token ]             │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  GitLab CI                             ○ Not setup │
│  [ Setup Guide ]                                   │
└───────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────┐
│  Jenkins                               ○ Not setup │
│  [ Setup Guide ]                                   │
└───────────────────────────────────────────────────┘
```

**GitHub Actions YAML (copy-paste ready):**
```yaml
name: FlowTest API Tests
on: [pull_request, push]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run FlowTest
        uses: flowtest/action@v1
        with:
          api-key: ${{ secrets.FLOWTEST_API_KEY }}
          suite: full-regression
          environment: staging
          compare-baseline: main        # enables differential testing
          fail-on-breaking-contracts: true
          fail-on-correctness-below: 99

      - name: Upload Report
        if: always()
        uses: flowtest/upload-report@v1
```

**CLI Reference:**
```bash
# Install
npm install -g flowtest-cli

# Run a suite
flowtest run --suite smoke-tests --env staging

# Run with load testing
flowtest run --flow create-order --users 200 --duration 3m --env staging

# Compare two branches
flowtest compare --baseline main --candidate feature/payment-v2

# Run and post PR comment
flowtest run --suite full-regression --pr 847 --post-comment

# Exit codes
# 0 = all passed
# 1 = test failures
# 2 = breaking contract changes
# 3 = correctness below threshold
```

---

## SCREEN 10 — AI Co-Pilot Panel

**Purpose:** AI assistance that augments, never replaces. Appears as a side panel across the app.

### Trigger Points
- "Generate tests from spec" button on Contracts screen
- "Explain this failure" button on any failed assertion
- "Suggest assertions" button in request editor

### Generate Tests from Spec
```
AI Test Generator
──────────────────────────────────────────────────
Imported: ecommerce-api-v2.yaml
Endpoints: 47

Generating test cases...

POST /orders  →  8 test cases drafted:

  ✏️ Draft 1: Happy path — valid order creation
     POST /orders with valid items → expect 201, body.id is number

  ✏️ Draft 2: Empty items array
     POST /orders with items:[] → expect 422, body.error present

  ✏️ Draft 3: Invalid product ID
     POST /orders with productId:-1 → expect 404 or 422

  ✏️ Draft 4: Missing required field (userId)
     POST /orders without userId → expect 422

  ✏️ Draft 5: Negative quantity
     POST /orders with qty:-1 → expect 422

  ✏️ Draft 6: Order over credit limit
     POST /orders with total > user.creditLimit → expect 402 or 422

  ✏️ Draft 7: Concurrent duplicate order
     Two identical POST /orders simultaneously → only one should succeed

  ✏️ Draft 8: Auth token expired
     POST /orders with expired JWT → expect 401

[ ✅ Accept All ]  [ Review each one ]  [ Reject All ]

Reviewing Draft 3:
  ┌──────────────────────────────────────────────────────┐
  │ Test name: Invalid product ID                        │
  │ Request:   POST /orders                              │
  │ Body:      { "items": [{ "productId": -1, "qty": 1}]}│
  │ Assert:    status is 404 or 422                      │
  │            body.error is string                      │
  │                                                      │
  │ [ ✅ Accept ] [ ✏️ Edit ] [ ❌ Reject ]              │
  └──────────────────────────────────────────────────────┘
```

### Failure Explanation (inline)
```
❌ Assertion failed: body.items.length == 1
   Failed 1,204 times out of 5,900 runs (20.4%)

AI Explanation:
  This failure pattern — occurring on ~20% of runs and clustering
  at high concurrency — is consistent with a race condition in
  cart item insertion. The empty items array suggests the order
  record was created before the items were committed to the
  database. Look at OrderService.create() for a missing await or
  a database transaction that isn't wrapping both the order
  creation and item insertion together.

  Common fix: wrap order + items insert in a single DB transaction,
  or use a database-level constraint to prevent orphaned orders.
```

---

## DESIGN NOTES FOR THE UI

### Visual Style
- **Theme:** Dark mode primary (bg: #0d1117, surface: #161b22, border: #30363d) — GitHub dark palette as reference
- **Accent colour:** Electric blue (#58a6ff) for interactive elements, red (#f85149) for failures, green (#3fb950) for passes, amber (#d29922) for warnings
- **Typography:** Monospace font (JetBrains Mono or similar) for all request/response data, code, and diffs. Sans-serif (Inter) for UI labels and prose
- **Density:** Medium-high — this is a professional tool, not a consumer app. Tables should show data without wasting whitespace

### Key UI Patterns
- **Split diff view** (like GitHub's PR diff view) for the comparison screen
- **Expandable rows** in all tables — click to see details inline without leaving the page
- **Real-time updates** — correctness % and request count should update live during a running load test (websocket-style, like a build log streaming in)
- **Inline AI explanations** — small "✨ Explain" button next to every failure, expands an AI callout inline
- **Status indicators** — consistent use of ✅ 🟡 ❌ ⚠️ across all screens for quick scanning

### Screens to Prioritise for Demo
In order of importance for a demonstration:

1. **Visual Workflow Builder canvas** — most visually distinctive, shows the "no code" angle
2. **Correctness-Under-Load results** — the table with correct% + per-step breakdown
3. **Differential Testing / Compare screen** — side-by-side diff view
4. **Dashboard** — gives the overall product context at a glance
5. **Contract Health panel** — drift detected, breaking change alert

### What to NOT build for demo
- Settings / billing / admin screens
- Full request editor (just show it, don't build all tabs)
- Actual working CLI (just show the code snippet)
- Team/user management

---

## DATA MODELS (for the frontend to reference)

### TestRun
```typescript
{
  id: string
  name: string
  status: 'running' | 'passed' | 'failed' | 'cancelled'
  suite: string
  environment: string
  triggeredBy: 'manual' | 'schedule' | 'pr' | 'push'
  startedAt: Date
  duration: number          // ms
  totalRequests: number
  correctRequests: number
  correctnessPercent: number
  steps: StepResult[]
}
```

### StepResult
```typescript
{
  stepId: string
  name: string
  endpoint: string
  totalRequests: number
  correctRequests: number
  failedAssertions: AssertionFailure[]
  p50: number
  p95: number
  p99: number
}
```

### ComparisonResult
```typescript
{
  id: string
  baseline: { branch: string, environment: string }
  candidate: { branch: string, environment: string }
  status: 'safe' | 'changed' | 'breaking'
  breakingChanges: DiffItem[]
  safeChanges: DiffItem[]
  endpointDiffs: EndpointDiff[]
}
```

### ContractDrift
```typescript
{
  endpoint: string
  method: string
  status: 'clean' | 'drift' | 'breaking'
  firstSeen: Date
  frequency: number         // 0-1, % of responses affected
  violations: {
    field: string
    expected: string
    actual: string
    severity: 'breaking' | 'warning'
  }[]
}
```
