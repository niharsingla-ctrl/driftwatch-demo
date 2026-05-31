import { Card } from "@/components/ui/card";
import { prComment } from "@/data";
import { XCircle, AlertTriangle, CheckCircle2, Github, Link2 } from "lucide-react";

function MethodTag({ method }: { method: string }) {
  return (
    <span className="mono inline-block w-10 shrink-0 text-2xs font-semibold text-accent">
      {method}
    </span>
  );
}

export function PrComment() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-2.5">
        <Github className="h-4 w-4 text-text-primary" />
        <span className="text-xs font-semibold">PR Comment Preview</span>
        <span className="ml-auto text-2xs text-muted">GitHub integration</span>
      </div>

      <div className="p-4 mono text-2xs leading-relaxed">
        <p className="font-semibold text-text-primary">
          Driftwatch Differential Report — {prComment.pr}
        </p>
        <p className="my-1 text-muted">
          Baseline: {prComment.baseline} → Candidate: {prComment.candidate}
        </p>
        <hr className="my-2 border-border" />

        {/* Breaking */}
        <div className="mb-3">
          <p className="flex items-center gap-1.5 font-semibold text-danger">
            <XCircle className="h-3.5 w-3.5" />
            {prComment.breaking.length} BREAKING CHANGES (merge blocked)
          </p>
          <div className="mt-1 space-y-0.5 pl-5">
            {prComment.breaking.map((b) => (
              <p key={b.endpoint} className="text-text-primary">
                <MethodTag method={b.method} />
                {b.endpoint}
                <span className="text-muted"> {b.note}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Behavioural */}
        <div className="mb-3">
          <p className="flex items-center gap-1.5 font-semibold text-warning">
            <AlertTriangle className="h-3.5 w-3.5" />
            {prComment.behavioural.length} BEHAVIOURAL CHANGES (safe, review
            recommended)
          </p>
          <div className="mt-1 space-y-0.5 pl-5">
            {prComment.behavioural.map((b) => (
              <p key={b.endpoint} className="text-text-primary">
                <MethodTag method={b.method} />
                {b.endpoint}
                <span className="text-muted"> {b.note}</span>
              </p>
            ))}
          </div>
        </div>

        {/* Unchanged */}
        <p className="flex items-center gap-1.5 font-semibold text-success">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {prComment.unchanged} ENDPOINTS UNCHANGED
        </p>

        <hr className="my-2 border-border" />
        <a className="flex items-center gap-1.5 text-accent hover:underline">
          <Link2 className="h-3.5 w-3.5" />
          Full report → {prComment.link}
        </a>
      </div>
    </Card>
  );
}
