import {
  Globe,
  Braces,
  GitBranch,
  Repeat,
  Split,
  Timer,
  Download,
  PenLine,
  Database,
  CheckCheck,
  FileJson,
  FileCheck2,
  Webhook,
  ScrollText,
  Trash2,
  Flag,
  CircleStop,
  type LucideIcon,
} from "lucide-react";

export type NodeCategory =
  | "request"
  | "logic"
  | "data"
  | "assertion"
  | "utility"
  | "terminal";

export interface NodeKindDef {
  label: string;
  category: NodeCategory;
  Icon: LucideIcon;
}

export const NODE_KINDS: Record<string, NodeKindDef> = {
  start: { label: "Start", category: "terminal", Icon: Flag },
  end: { label: "End", category: "terminal", Icon: CircleStop },
  apiRequest: { label: "API Request", category: "request", Icon: Globe },
  graphql: { label: "GraphQL Query", category: "request", Icon: Braces },
  condition: { label: "Condition", category: "logic", Icon: GitBranch },
  loop: { label: "Loop", category: "logic", Icon: Repeat },
  parallel: { label: "Parallel", category: "logic", Icon: Split },
  join: { label: "Join", category: "logic", Icon: Split },
  wait: { label: "Wait/Delay", category: "logic", Icon: Timer },
  extract: { label: "Extract Variable", category: "data", Icon: Download },
  setVar: { label: "Set Variable", category: "data", Icon: PenLine },
  dataSource: { label: "Data Source", category: "data", Icon: Database },
  assert: { label: "Assert", category: "assertion", Icon: CheckCheck },
  schemaCheck: { label: "Schema Check", category: "assertion", Icon: FileJson },
  contractCheck: {
    label: "Contract Check",
    category: "assertion",
    Icon: FileCheck2,
  },
  webhook: { label: "Webhook Listener", category: "utility", Icon: Webhook },
  log: { label: "Log", category: "utility", Icon: ScrollText },
  cleanup: { label: "Cleanup", category: "utility", Icon: Trash2 },
};

export const CATEGORY_STYLE: Record<
  NodeCategory,
  { text: string; border: string; bg: string; dot: string }
> = {
  request: {
    text: "text-accent",
    border: "border-accent/50",
    bg: "bg-accent/10",
    dot: "bg-accent",
  },
  logic: {
    text: "text-warning",
    border: "border-warning/50",
    bg: "bg-warning/10",
    dot: "bg-warning",
  },
  data: {
    text: "text-[#bc8cff]",
    border: "border-[#bc8cff]/50",
    bg: "bg-[#bc8cff]/10",
    dot: "bg-[#bc8cff]",
  },
  assertion: {
    text: "text-success",
    border: "border-success/50",
    bg: "bg-success/10",
    dot: "bg-success",
  },
  utility: {
    text: "text-[#39c5cf]",
    border: "border-[#39c5cf]/50",
    bg: "bg-[#39c5cf]/10",
    dot: "bg-[#39c5cf]",
  },
  terminal: {
    text: "text-muted",
    border: "border-border",
    bg: "bg-surface-2",
    dot: "bg-muted",
  },
};
