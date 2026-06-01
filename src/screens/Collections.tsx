import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Send,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  FolderOpen,
  Check,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { cn } from "@/lib/utils";

/* ── Collection tree data ─────────────────────────────────── */
interface Req {
  m: string;
  p: string;
}
const TREE: { folder: string; requests: Req[] }[] = [
  {
    folder: "Auth",
    requests: [
      { m: "POST", p: "/auth/login" },
      { m: "POST", p: "/auth/logout" },
      { m: "GET", p: "/auth/me" },
    ],
  },
  {
    folder: "Orders",
    requests: [
      { m: "GET", p: "/orders" },
      { m: "GET", p: "/orders/{id}" },
      { m: "POST", p: "/orders" },
      { m: "PATCH", p: "/orders/{id}/status" },
    ],
  },
  {
    folder: "Users",
    requests: [
      { m: "GET", p: "/users" },
      { m: "GET", p: "/users/{id}" },
      { m: "POST", p: "/users" },
    ],
  },
  {
    folder: "Products",
    requests: [
      { m: "GET", p: "/products" },
      { m: "GET", p: "/products/{id}" },
    ],
  },
];

const METHOD_COLOR: Record<string, string> = {
  GET: "text-success",
  POST: "text-warning",
  PUT: "text-accent",
  PATCH: "text-[#bc8cff]",
  DELETE: "text-danger",
};

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const FIELDS = [
  "status code",
  "body.id",
  "body.items",
  "body.items.length",
  "body.userId",
  "body.total",
  "body.status",
  "response time",
  "header",
];
const OPERATORS = [
  "is",
  "is not",
  "contains",
  "greater than",
  "less than",
  "is type",
  "matches regex",
];

const TABS = [
  "Params",
  "Headers",
  "Body",
  "Auth",
  "Assertions",
  "Scripts",
  "Examples",
];

const DEFAULT_BODY = `{
  "items": [{ "productId": 5, "qty": 1 }],
  "userId": "{{userId}}"
}`;

const RESPONSE_BODY = `{
  "id": 1,
  "status": "pending",
  "total": 99.99,
  "tax": 8.50,
  "items": [{ "productId": 5, "qty": 1, "price": 91.49 }],
  "userId": 5,
  "created_at": "2026-05-31T10:00:00Z"
}`;

const PRE_SCRIPT = `// Runs before the request
const timestamp = Date.now();
pm.variables.set("requestTime", timestamp);`;

const TEST_SCRIPT = `// Runs after response — write assertions in code
pm.test("Status is 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Order has items", () => {
  const body = pm.response.json();
  pm.expect(body.items).to.be.an("array");
  pm.expect(body.items.length).to.be.above(0);
});

// Extract for next request
const body = pm.response.json();
pm.environment.set("orderId", body.id);`;

const AI_TEST_SCRIPT = `// AI-generated assertions for POST /orders
// Based on your OpenAPI spec + response sample

pm.test("Status is 201 Created", () => {
  pm.response.to.have.status(201);
});

pm.test("Response matches OpenAPI contract", () => {
  const schema = pm.openApiSchema.get("/orders", "POST");
  pm.response.to.matchSchema(schema);
});

pm.test("Order ID is a positive integer", () => {
  const body = pm.response.json();
  pm.expect(body.id).to.be.a("number").above(0);
});

pm.test("Items array is not empty", () => {
  const body = pm.response.json();
  pm.expect(body.items).to.be.an("array").with.length.above(0);
});

pm.test("Tax is a number not a string", () => {
  const body = pm.response.json();
  pm.expect(body.tax).to.be.a("number");
  // ⚠️ AI note: detected float→string drift on this
  // field in recent contract checks. Added type guard.
});

pm.test("Response under 500ms", () => {
  pm.expect(pm.response.responseTime).to.be.below(500);
});`;

interface AssertionRow {
  id: number;
  field: string;
  op: string;
  value: string;
}
const SEED_ASSERTIONS: AssertionRow[] = [
  { id: 1, field: "status code", op: "is", value: "201" },
  { id: 2, field: "body.id", op: "is type", value: "number" },
  { id: 3, field: "body.items", op: "is type", value: "array" },
  { id: 4, field: "body.items.length", op: "greater than", value: "0" },
  { id: 5, field: "body.userId", op: "is", value: "{{userId}}" },
  { id: 6, field: "response time", op: "less than", value: "500ms" },
];

export function Collections() {
  const [selected, setSelected] = useState("Orders:POST:/orders");
  const [method, setMethod] = useState("POST");
  const [url, setUrl] = useState("{{BASE_URL}}/orders");
  const [tab, setTab] = useState("Body");

  const selectRequest = (folder: string, r: Req) => {
    setSelected(`${folder}:${r.m}:${r.p}`);
    setMethod(r.m);
    setUrl(`{{BASE_URL}}${r.p}`);
  };

  return (
    <div className="flex h-[calc(100vh-85px)]">
      {/* LEFT — tree */}
      <aside className="w-64 shrink-0 overflow-y-auto border-r border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-2xs font-semibold uppercase tracking-wide text-muted">
            Collections
          </p>
          <Plus className="h-3.5 w-3.5 cursor-pointer text-muted hover:text-text-primary" />
        </div>
        <Tree selected={selected} onSelect={selectRequest} />
      </aside>

      {/* RIGHT — editor + response */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
          <Select
            value={method}
            options={METHODS}
            onChange={setMethod}
            width={92}
            colorMap={METHOD_COLOR}
            mono
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-8 flex-1 rounded-md border border-border bg-bg px-2.5 mono text-xs text-text-primary focus:border-accent focus:outline-none"
          />
          <Button size="default">
            <Send className="h-3.5 w-3.5" /> Send
          </Button>
          <Button variant="secondary" size="default">
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border bg-surface px-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-2.5 py-2 text-xs font-medium transition-colors",
                tab === t
                  ? "border-accent text-text-primary"
                  : "border-transparent text-muted hover:text-text-primary"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-0 flex-1 overflow-y-auto bg-bg">
          {tab === "Body" && <BodyTab />}
          {tab === "Assertions" && <AssertionsTab />}
          {tab === "Scripts" && <ScriptsTab />}
          {tab === "Headers" && <HeadersTab />}
          {tab === "Params" && (
            <Placeholder text="No query params for this request. Add path/query parameters here." />
          )}
          {tab === "Auth" && (
            <Placeholder text="Auth: Bearer Token · {{token}} (inherited from environment)." />
          )}
          {tab === "Examples" && (
            <Placeholder text="2 saved examples — “201 Created” and “422 Empty items”." />
          )}
        </div>

        {/* Response panel */}
        <ResponsePanel />
      </section>
    </div>
  );
}

/* ── Tree ─────────────────────────────────────────────────── */
function Tree({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (folder: string, r: Req) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    root: true,
    Auth: true,
    Orders: true,
    Users: true,
    Products: true,
  });
  const toggle = (k: string) => setOpen((s) => ({ ...s, [k]: !s[k] }));

  return (
    <div className="py-1 text-xs">
      {/* root collection */}
      <button
        onClick={() => toggle("root")}
        className="flex w-full items-center gap-1.5 px-2 py-1.5 font-semibold text-text-primary hover:bg-surface-2"
      >
        {open.root ? (
          <ChevronDown className="h-3.5 w-3.5 text-muted" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-muted" />
        )}
        <FolderOpen className="h-3.5 w-3.5 text-accent" />
        E-commerce API
      </button>

      {open.root &&
        TREE.map((grp) => (
          <div key={grp.folder}>
            <button
              onClick={() => toggle(grp.folder)}
              className="flex w-full items-center gap-1.5 py-1.5 pl-5 pr-2 font-medium text-text-primary hover:bg-surface-2"
            >
              {open[grp.folder] ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted" />
              )}
              <span className="text-muted">{grp.folder}</span>
            </button>
            {open[grp.folder] &&
              grp.requests.map((r) => {
                const key = `${grp.folder}:${r.m}:${r.p}`;
                const isSel = selected === key;
                return (
                  <button
                    key={key}
                    onClick={() => onSelect(grp.folder, r)}
                    className={cn(
                      "flex w-full items-center gap-2 py-1.5 pl-10 pr-2 text-left mono hover:bg-surface-2",
                      isSel && "border-l-2 border-accent bg-accent/[0.07]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-10 shrink-0 text-2xs font-semibold",
                        METHOD_COLOR[r.m]
                      )}
                    >
                      {r.m}
                    </span>
                    <span
                      className={cn(
                        "truncate",
                        isSel ? "text-text-primary" : "text-muted"
                      )}
                    >
                      {r.p}
                    </span>
                  </button>
                );
              })}
          </div>
        ))}
    </div>
  );
}

/* ── Tabs ─────────────────────────────────────────────────── */
function BodyTab() {
  const [body, setBody] = useState(DEFAULT_BODY);
  return (
    <div className="p-3">
      <div className="mb-2 flex items-center gap-2 text-2xs text-muted">
        <span className="rounded border border-border bg-surface-2 px-1.5 py-0.5 text-text-primary">
          raw
        </span>
        <span className="rounded px-1.5 py-0.5">JSON</span>
      </div>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        spellCheck={false}
        rows={6}
        className="w-full resize-y rounded-md border border-border bg-[#0b0f15] p-3 mono text-xs leading-relaxed text-text-primary focus:border-accent focus:outline-none"
      />
    </div>
  );
}

function HeadersTab() {
  const headers = [
    { k: "Authorization", v: "Bearer {{token}}" },
    { k: "Content-Type", v: "application/json" },
    { k: "Accept", v: "application/json" },
  ];
  return (
    <div className="p-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left text-2xs uppercase tracking-wide text-muted">
            <th className="py-1.5 font-medium">Key</th>
            <th className="py-1.5 font-medium">Value</th>
          </tr>
        </thead>
        <tbody>
          {headers.map((h) => (
            <tr key={h.k} className="border-b border-border-muted">
              <td className="py-1.5 mono text-accent">{h.k}</td>
              <td className="py-1.5 mono text-text-primary">{h.v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssertionsTab() {
  const [rows, setRows] = useState<AssertionRow[]>(SEED_ASSERTIONS);
  const [nextId, setNextId] = useState(7);
  const [extractions, setExtractions] = useState([
    { id: 1, name: "orderId", from: "response.body.id" },
  ]);
  const [nextEx, setNextEx] = useState(2);

  const update = (id: number, patch: Partial<AssertionRow>) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));
  const add = () => {
    setRows((rs) => [
      ...rs,
      { id: nextId, field: "body.id", op: "is", value: "" },
    ]);
    setNextId((n) => n + 1);
  };

  return (
    <div className="space-y-4 p-3">
      <div>
        <div className="overflow-hidden rounded-md border border-border">
          {rows.map((r, i) => (
            <div
              key={r.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5",
                i !== rows.length - 1 && "border-b border-border-muted"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" />
              <Select
                value={r.field}
                options={FIELDS}
                onChange={(field) => update(r.id, { field })}
                width={150}
                mono
              />
              <Select
                value={r.op}
                options={OPERATORS}
                onChange={(op) => update(r.id, { op })}
                width={130}
              />
              <input
                value={r.value}
                onChange={(e) => update(r.id, { value: e.target.value })}
                placeholder="value"
                className="h-7 flex-1 rounded-md border border-border bg-bg px-2 mono text-xs text-text-primary focus:border-accent focus:outline-none"
              />
              <button
                onClick={() => remove(r.id)}
                className="text-muted hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={add}
          className="mt-2 flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add Assertion
        </button>
      </div>

      {/* Extract variables */}
      <div className="border-t border-border-muted pt-3">
        <p className="mb-2 text-2xs font-semibold uppercase tracking-wide text-muted">
          Extract Variables
        </p>
        <div className="overflow-hidden rounded-md border border-border">
          {extractions.map((ex, i) => (
            <div
              key={ex.id}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5",
                i !== extractions.length - 1 && "border-b border-border-muted"
              )}
            >
              <input
                value={ex.name}
                onChange={(e) =>
                  setExtractions((xs) =>
                    xs.map((x) =>
                      x.id === ex.id ? { ...x, name: e.target.value } : x
                    )
                  )
                }
                className="h-7 w-32 rounded-md border border-border bg-bg px-2 mono text-xs text-[#bc8cff] focus:border-accent focus:outline-none"
              />
              <span className="text-muted">←</span>
              <input
                value={ex.from}
                onChange={(e) =>
                  setExtractions((xs) =>
                    xs.map((x) =>
                      x.id === ex.id ? { ...x, from: e.target.value } : x
                    )
                  )
                }
                className="h-7 flex-1 rounded-md border border-border bg-bg px-2 mono text-xs text-text-primary focus:border-accent focus:outline-none"
              />
              <button
                onClick={() =>
                  setExtractions((xs) => xs.filter((x) => x.id !== ex.id))
                }
                className="text-muted hover:text-danger"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            setExtractions((xs) => [
              ...xs,
              { id: nextEx, name: "newVar", from: "response.body.field" },
            ]);
            setNextEx((n) => n + 1);
          }}
          className="mt-2 flex items-center gap-1 text-xs text-accent hover:underline"
        >
          <Plus className="h-3.5 w-3.5" /> Add extraction
        </button>
      </div>
    </div>
  );
}

function ScriptsTab() {
  const [testScript, setTestScript] = useState(TEST_SCRIPT);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = () => {
    setGenerating(true);
    setGenerated(false);
    const lines = AI_TEST_SCRIPT.split("\n");
    let i = 0;
    setTestScript("");
    const timer = setInterval(() => {
      i += 1;
      setTestScript(lines.slice(0, i).join("\n"));
      if (i >= lines.length) {
        clearInterval(timer);
        setGenerating(false);
        setGenerated(true);
      }
    }, 90);
  };

  return (
    <div className="flex flex-col p-3">
      {generated && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-[#bc8cff]/30 bg-[#bc8cff]/[0.07] px-3 py-2 text-xs text-text-primary/90">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#bc8cff]" />
          <span>
            6 assertions generated from your OpenAPI spec and response sample.
            Edit freely — this is your code.
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="overflow-hidden rounded-md border border-border">
          <div className="border-b border-border bg-surface-2 px-3 py-1.5 text-2xs font-semibold uppercase tracking-wide text-muted">
            Pre-request Script
          </div>
          <CodeBlock code={PRE_SCRIPT} className="max-h-72" />
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-1">
            <span className="text-2xs font-semibold uppercase tracking-wide text-muted">
              Test Script
            </span>
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-1 rounded border border-[#bc8cff]/40 px-1.5 py-0.5 text-2xs font-medium text-[#bc8cff] hover:bg-[#bc8cff]/10 disabled:opacity-60"
            >
              {generating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              {generating ? "Generating…" : "Generate assertions"}
            </button>
          </div>
          {generating || generated ? (
            <div className="relative">
              <CodeBlock code={testScript} className="max-h-72" />
              {generating && (
                <span className="pointer-events-none absolute bottom-2 left-10 animate-pulse mono text-2xs text-[#bc8cff]">
                  ▋
                </span>
              )}
            </div>
          ) : (
            <CodeBlock code={testScript} className="max-h-72" />
          )}
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2 rounded-md border border-accent/30 bg-accent/[0.06] px-3 py-2 text-xs text-text-primary/90">
        <span>💡</span>
        <span>
          Prefer visual assertions? Switch to the{" "}
          <span className="font-semibold text-accent">Assertions</span> tab.
          Both tabs produce the same test — use whichever you prefer.
        </span>
      </div>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center text-xs text-muted">
      {text}
    </div>
  );
}

/* ── Response panel ───────────────────────────────────────── */
function ResponsePanel() {
  return (
    <div className="shrink-0 border-t border-border bg-surface">
      <div className="flex items-center gap-3 border-b border-border px-3 py-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-success/40 bg-success/10 px-2 py-0.5 font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" /> 201 Created
        </span>
        <span className="text-muted">
          Time: <span className="mono text-text-primary">87ms</span>
        </span>
        <span className="text-muted">
          Size: <span className="mono text-text-primary">412 B</span>
        </span>
        <div className="ml-4 flex items-center gap-1">
          {["Body", "Headers", "Contract Check", "Timeline"].map((t, i) => (
            <span
              key={t}
              className={cn(
                "rounded-md px-2 py-0.5 text-2xs",
                i === 0
                  ? "bg-surface-2 text-text-primary"
                  : "text-muted"
              )}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="max-h-56 overflow-y-auto p-3">
        <CodeBlock code={RESPONSE_BODY} lineNumbers={false} className="rounded-md border border-border p-2" />
        <div className="mt-3 space-y-1.5">
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              Contract Check: Response matches OpenAPI spec — all required
              fields present, all types correct
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-xs text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Assertions: 5/5 passed
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Reusable dropdown ────────────────────────────────────── */
function Select({
  value,
  options,
  onChange,
  width,
  mono,
  colorMap,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
  width?: number;
  mono?: boolean;
  colorMap?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" style={{ width }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-full items-center justify-between gap-1.5 rounded-md border border-border bg-bg px-2 text-xs hover:border-accent"
      >
        <span
          className={cn(
            "truncate font-semibold",
            mono && "mono",
            colorMap?.[value] ?? "text-text-primary"
          )}
        >
          {value}
        </span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-8 z-50 max-h-64 w-full min-w-[120px] overflow-y-auto rounded-md border border-border bg-surface p-1 shadow-xl">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-surface-2",
                  mono && "mono",
                  colorMap?.[o] ?? (o === value ? "text-accent" : "text-text-primary")
                )}
              >
                {o}
                {o === value && (
                  <Check className="ml-auto h-3.5 w-3.5 text-accent" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
