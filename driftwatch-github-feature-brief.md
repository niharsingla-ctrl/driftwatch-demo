# Driftwatch — GitHub PR Integration

## Competitive Brief: What Exists vs What We're Building

_Prepared for internal review · June 2026_

---

## Background

Driftwatch includes a GitHub Pull Request integration that automatically tests API changes whenever a developer opens a PR. This document maps each component of that feature against what currently exists in the market — so we know what we are building from scratch versus what already exists (and can potentially be reused).

---

## Our GitHub PR Feature — 6 Components

When a developer opens a Pull Request, Driftwatch automatically:

1. Triggers test runs on PR open
2. Spins up isolated environments for both branches
3. Runs the same test suite against both branches simultaneously
4. Compares live API response bodies field by field
5. Posts one unified comment on the PR with all results
6. Blocks the merge if breaking changes are detected

---

## Component-by-Component Analysis

---

### Component 1 — Trigger test runs when a PR is opened

**Status: ✅ EXISTS — industry standard**

Every major API testing tool supports this. It is a standard GitHub Actions trigger (`on: pull_request`) and is not a differentiator.

| Tool           | Has this | Open Source | License    |
| -------------- | -------- | ----------- | ---------- |
| Bruno          | ✅       | ✅          | MIT        |
| Postman Newman | ✅       | ✅          | Apache 2.0 |
| oasdiff        | ✅       | ✅          | Apache 2.0 |
| k6             | ✅       | ✅          | AGPL-3.0   |
| StackHawk      | ✅       | ❌          | Paid       |

**Build vs Reuse:** Standard GitHub Actions config. No custom work needed beyond writing the YAML.

---

### Component 2 — Spin up isolated environments for both branches automatically

**Status: ⚠️ PARTIALLY EXISTS — only for Kubernetes teams**

**Signadot** does exactly this — it creates isolated sandbox environments per branch automatically when a PR opens and tears them down when it closes. However it is Kubernetes-only and paid.

For non-Kubernetes teams no API testing tool handles the environment spin-up automatically. Teams currently do this manually using Docker Compose, cloud preview environments (Vercel, Railway, Render), or custom GitHub Actions scripts.

| Tool                         | Has this    | Open Source | License | Notes                             |
| ---------------------------- | ----------- | ----------- | ------- | --------------------------------- |
| Signadot                     | ✅          | ❌          | Paid    | Kubernetes only                   |
| Vercel Preview               | ✅          | ❌          | Paid    | Frontend only                     |
| Docker Compose in GH Actions | ✅ (manual) | ✅          | Free    | Requires custom setup per project |
| Everything else              | ❌          | —           | —       | —                                 |

**Build vs Reuse:** We need to build the orchestration layer that handles environment spin-up. For internal use, Docker Compose in GitHub Actions is the practical approach. No off-the-shelf solution exists for non-Kubernetes backends.

---

### Component 3 — Run the same test suite against BOTH environments simultaneously

**Status: ❌ DOES NOT EXIST anywhere**

Every existing tool runs tests against one environment. The concept of running an identical test suite against the old version and the new version at the same time, then comparing the outputs, has not been built by any tool.

| Tool             | Has this | Notes                                                                       |
| ---------------- | -------- | --------------------------------------------------------------------------- |
| Postman / Newman | ❌       | Runs against one environment only                                           |
| Bruno            | ❌       | Runs against one environment only                                           |
| k6               | ❌       | Runs against one environment only                                           |
| Diffy (Twitter)  | ⚠️       | Similar concept but uses real production traffic, not synthetic test suites |
| Everything else  | ❌       | —                                                                           |

**Diffy note:** Diffy (open source, Apache 2.0, built by Twitter, used by Airbnb and ByteDance) runs the same real traffic against two instances and diffs responses. But it works only by mirroring live production traffic — you cannot tell it to run a specific test scenario with specific inputs. This is the closest existing concept but it is fundamentally different from running a controlled synthetic test suite.

**Build vs Reuse:** Must build from scratch. The test runner orchestration that fires the same test suite against two environments in parallel is new engineering. However we can borrow Diffy's diff algorithm (Apache 2.0) for the comparison step.

---

### Component 4 — Compare live API response bodies field by field

**Status: ⚠️ PARTIALLY EXISTS — for real traffic, not synthetic tests**

**Diffy** (Twitter, open source Apache 2.0) is the only production-proven tool that does field-by-field live HTTP response comparison. It also has a noise cancellation algorithm that filters out fields that always differ (timestamps, generated IDs) so only meaningful regressions are flagged. Used in production at Twitter, Airbnb, Baidu, ByteDance.

**api-diff** (Radar Labs, open source MIT) is a CLI tool that calls two URLs with the same inputs and diffs the JSON responses. Not automated, not PR-integrated — you run it manually.

| Tool              | Has this | Open Source | License    | Notes                                |
| ----------------- | -------- | ----------- | ---------- | ------------------------------------ |
| Diffy (opendiffy) | ✅       | ✅          | Apache 2.0 | Real traffic only, not synthetic     |
| api-diff (Radar)  | ✅       | ✅          | MIT        | Manual CLI only, no PR integration   |
| oasdiff           | ❌       | ✅          | Apache 2.0 | Diffs spec files, not live responses |
| Everything else   | ❌       | —           | —          | —                                    |

**Build vs Reuse:** We can take Diffy's noise cancellation algorithm (Apache 2.0 — commercially usable) and apply it to our synthetic test results. The diff logic itself does not need to be written from scratch. What we build is the integration layer: run synthetic tests → collect both responses → apply Diffy-style diff → format output.

---

### Component 5 — Post ONE unified PR comment combining all results

**Status: ❌ DOES NOT EXIST anywhere — this is our most unique feature**

This is the clearest gap in the market. Today every tool posts its own separate PR comment:

```
Bot 1 (oasdiff):     "2 breaking contract changes detected"
Bot 2 (Newman):      "47/47 tests passed"
Bot 3 (k6):          "p95: 340ms, error rate: 0.8%"
Bot 4 (StackHawk):   "3 security vulnerabilities found"
```

Four separate comments, four separate bots, no unified verdict, no single merge decision. The developer has to read all four and make their own judgement.

What Driftwatch posts instead:

```
Driftwatch Report — PR #847
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTRACT CHANGES
  ❌ BREAKING   POST /orders     body.tax type: float → string
  ✅ SAFE       GET /orders/{id} new field 'estimated_delivery'

FUNCTIONAL TESTS
  ✅ 134/134 passed

CORRECTNESS UNDER LOAD
  ❌ create-order flow @ 200 users
     94.1% correct (target: 99%)
     Race condition in OrderService.create()

STATUS: ❌ Merge blocked — 1 breaking change, 1 correctness failure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔗 Full report → driftwatch.app/runs/pr-847
```

| Tool              | Has unified comment | Open Source | Notes                      |
| ----------------- | ------------------- | ----------- | -------------------------- |
| Any existing tool | ❌                  | —           | All post separate comments |
| Driftwatch        | ✅                  | —           | We build this              |

**Build vs Reuse:** The unified comment is glue code — we collect output from our test runner + oasdiff + correctness checker and format it into one GitHub API call (`POST /repos/{owner}/{repo}/issues/{number}/comments`). The GitHub API itself is free. The formatter is custom but straightforward to build.

---

### Component 6 — Block the merge if breaking changes are detected

**Status: ✅ PARTIALLY EXISTS — for spec changes and test failures only**

**oasdiff** can set a required GitHub status check that blocks merges when breaking spec changes are detected. This is well built and production-ready.

**Newman/Bruno** exit with code 1 on test failure, which GitHub interprets as a failed required check and blocks the merge.

What does NOT exist: blocking merge based on correctness-under-load dropping below a threshold, or based on live response body diff showing breaking changes that aren't in the spec.

| Tool       | Blocks on                                             | Open Source | License       |
| ---------- | ----------------------------------------------------- | ----------- | ------------- |
| oasdiff    | Spec breaking changes                                 | ✅          | Apache 2.0    |
| Newman     | Functional test failure                               | ✅          | Apache 2.0    |
| Bruno CLI  | Functional test failure                               | ✅          | MIT           |
| k6         | Performance threshold                                 | ✅          | AGPL-3.0      |
| Driftwatch | All of the above + correctness % + live response diff | —           | We build this |

**Build vs Reuse:** The merge blocking mechanism itself is just GitHub required status checks — free and standard. The unique part is what we feed into it: our correctness threshold check and live response diff result, which no existing tool provides.

---

## Summary Table

| Component                             | Exists?                      | Open Source Available? | What we build                   |
| ------------------------------------- | ---------------------------- | ---------------------- | ------------------------------- |
| Trigger on PR open                    | ✅ Standard                  | ✅ All tools           | Just YAML config                |
| Auto-deploy both branches             | ⚠️ K8s only (Signadot)       | ❌                     | Docker orchestration layer      |
| Run tests against both simultaneously | ❌ Nobody                    | ❌                     | New — test runner orchestration |
| Field-by-field response diff          | ⚠️ Real traffic only (Diffy) | ✅ Apache 2.0          | Adapt Diffy's algorithm         |
| Unified PR comment                    | ❌ Nobody                    | ❌                     | New — result formatter          |
| Block merge                           | ✅ Spec + tests only         | ✅ oasdiff, Newman     | Extend with our signals         |

---

## Open Source Components We Can Use

| Tool                  | What we use it for                          | License    | Can use commercially? |
| --------------------- | ------------------------------------------- | ---------- | --------------------- |
| **oasdiff**           | Spec-to-spec breaking change detection      | Apache 2.0 | ✅ Yes                |
| **Diffy (opendiffy)** | Noise-cancelling response diff algorithm    | Apache 2.0 | ✅ Yes                |
| **api-diff (Radar)**  | JSON response comparison logic              | MIT        | ✅ Yes                |
| **k6**                | Load test execution engine                  | AGPL-3.0   | ⚠️ Check AGPL terms   |
| **Bruno CLI**         | Reference for GitHub Actions YAML pattern   | MIT        | ✅ Yes                |
| **Dredd**             | OpenAPI spec vs live response validation    | MIT        | ✅ Yes                |
| **Schemathesis**      | Edge case test generation from OpenAPI spec | MIT        | ✅ Yes                |

---

## What We Are Genuinely Building From Scratch

1. **Test runner orchestration** — fires the same test suite against two environments in parallel, collects both sets of responses
2. **Result aggregator** — takes outputs from k6 + oasdiff + response diff and combines them
3. **Unified PR comment formatter** — formats the combined result into one clean GitHub comment with a clear merge verdict
4. **Correctness threshold gate** — blocks merge when correctness % drops below the configured target (e.g. 99%)
5. **The Driftwatch platform UI** — dashboard, workflow builder, results screens

---

## Key Competitive Insight

The closest analogy in the market is **Chromatic/Percy for frontend** — tools that take a screenshot of the old UI and new UI on every PR and diff them visually, then post the diff as a PR comment and block merge on visual regressions.

That concept applied to APIs — "run the same requests against old and new, diff the responses, post the diff, block on breaking changes" — **has never been built as a complete integrated product.**

Optic (acquired by Atlassian) attempted the spec-diff part of this and was shut down in January 2026. That team's customers are actively looking for a replacement right now.

---

_Document prepared based on research conducted June 2026._
_Tools verified: Bruno, Postman Newman, oasdiff, k6, Diffy, api-diff, Signadot, StackHawk, Dredd, Schemathesis, Optic, Chromatic._
