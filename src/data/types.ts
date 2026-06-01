export type RunStatus = "running" | "passed" | "failed" | "cancelled";

export interface RecentRun {
  id: string;
  name: string;
  status: "pass" | "fail" | "running";
  correctPercent: number | null;
  p95: string;
  triggeredBy: string;
  time: string;
}

export interface ContractRow {
  endpoint: string;
  status: "clean" | "drift" | "breaking";
  lastChecked: string;
  detail?: string;
}

export interface ComparisonRow {
  pr: string;
  branch: string;
  status: "running" | "safe" | "blocked";
  summary: string;
}

export interface AssertionFailure {
  expression: string;
  count: number;
}

export interface StepResult {
  stepId: string;
  name: string;
  endpoint: string;
  requests: number;
  correct: number;
  wrong: number;
  correctPercent: number;
  p50: string;
  p95: string;
  p99: string;
  failed: boolean;
  failures: AssertionFailure[];
}

export interface SampleFailure {
  requestId: string;
  at: string;
  sent: string;
  expected: string;
  got: string;
  gotNote: string;
}

export type DiffStatus = "breaking" | "changed" | "slower" | "unchanged";

export interface EndpointDiff {
  endpoint: string;
  method: string;
  status: DiffStatus;
  summary: string;
}
