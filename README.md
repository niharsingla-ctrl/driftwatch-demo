# Driftwatch — Advanced API Testing (Frontend Demo)

A static, dark-mode frontend demo for **Driftwatch**, a concept API-testing
platform that combines an API client, load testing, differential ("branch vs
branch") testing, and OpenAPI contract drift detection.

> ⚠️ This is a **frontend demo only**. All data is hardcoded — there is no
> backend, no API calls, and no persistence. Edits you make in the UI live in
> memory and reset on page refresh.

## Screens

| Screen | What it shows |
| --- | --- |
| **Dashboard** | API health, recent runs (editable), contract drift, active comparisons |
| **Collections** | Request library + editor with a visual assertion builder and script editor |
| **Workflow Builder** | Drag-and-drop test-flow canvas (React Flow) with a Script view and an AI Flow Generator |
| **Correctness-Under-Load** | Per-step correctness table, failure analysis, and charts for a 200-user run |
| **Compare** | Side-by-side branch diff, endpoint diff table, and a PR-comment preview |

## Tech stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/) (dark mode only)
- [React Flow](https://reactflow.dev/) — workflow canvas
- [Recharts](https://recharts.org/) — charts
- [Lucide](https://lucide.dev/) — icons

## Prerequisites

- **Node.js 20 or newer** (check with `node --version`)
- npm (ships with Node)

## Setup

```bash
# 1. Clone the repository
git clone https://github.com/niharsingla-ctrl/driftwatch-demo.git
cd driftwatch-demo

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open the URL Vite prints (default **http://localhost:5173**).

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build the production bundle into `dist/` |
| `npm run preview` | Serve the built `dist/` locally to preview the production build |
| `npm run lint` | Type-check the project without emitting files |

## Project structure

```
src/
├── App.tsx                 # App shell + screen routing
├── main.tsx                # React entry point
├── index.css               # Tailwind + global styles
├── components/             # Shared UI (TopNav, CodeBlock, RunOverlay, ui/*)
├── store/AppStore.tsx      # In-session state (env, runs, workflow graph, ...)
├── hooks/                  # useSimulation (fake streaming load test)
├── data/                   # All hardcoded demo data + types
└── screens/
    ├── Dashboard.tsx
    ├── Collections.tsx
    ├── WorkflowBuilder.tsx
    ├── LoadResults.tsx
    ├── Compare.tsx
    ├── workflow/           # Canvas nodes, properties, AI flow generator
    ├── load/               # Charts
    └── compare/            # Diff viewer, PR comment
```

## Notes

- Dark mode only (GitHub-dark palette). Fonts: Inter (UI) + JetBrains Mono (code).
- The "Run" buttons trigger simulated streaming results — no real requests are made.
