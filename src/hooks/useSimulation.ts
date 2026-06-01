import { useCallback, useEffect, useRef, useState } from "react";

export interface SimTick {
  progress: number; // 0..1
  requests: number;
  correct: number;
  correctness: number; // %
  elapsedSec: number;
  logLine?: string;
}

export interface SimConfig {
  durationMs?: number;
  totalRequests?: number;
  /** correctness curve sampled at progress p (0..1) → percentage */
  curve?: (p: number) => number;
  logs?: { at: number; text: string }[];
}

export interface SimState extends SimTick {
  status: "idle" | "running" | "done";
  log: string[];
}

const DEFAULT_CURVE = (p: number) => {
  // healthy until ~30%, dips during peak concurrency, partially recovers
  if (p < 0.3) return 100 - p * 3;
  if (p < 0.6) return 99 - (p - 0.3) * 33; // drops toward ~89
  return 89 + (p - 0.6) * 18; // recovers toward ~96
};

const init: SimState = {
  status: "idle",
  progress: 0,
  requests: 0,
  correct: 0,
  correctness: 100,
  elapsedSec: 0,
  log: [],
};

/** Drives a fake streaming load test — ticks counters and a log up to 100%. */
export function useSimulation() {
  const [state, setState] = useState<SimState>(init);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const cfg = useRef<Required<SimConfig>>({
    durationMs: 3200,
    totalRequests: 35982,
    curve: DEFAULT_CURVE,
    logs: [],
  });

  const stop = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    setState(init);
  }, [stop]);

  const start = useCallback(
    (config: SimConfig = {}) => {
      stop();
      cfg.current = {
        durationMs: config.durationMs ?? 3200,
        totalRequests: config.totalRequests ?? 35982,
        curve: config.curve ?? DEFAULT_CURVE,
        logs: config.logs ?? [],
      };
      const startedAt = Date.now();
      const firedLogs = new Set<number>();
      setState({ ...init, status: "running" });

      timer.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const p = Math.min(1, elapsed / cfg.current.durationMs);
        const requests = Math.round(p * cfg.current.totalRequests);
        const correctness = Math.max(
          70,
          Math.min(100, cfg.current.curve(p))
        );
        const correct = Math.round(requests * (correctness / 100));

        const newLogs: string[] = [];
        cfg.current.logs.forEach((l, i) => {
          if (p >= l.at && !firedLogs.has(i)) {
            firedLogs.add(i);
            newLogs.push(l.text);
          }
        });

        setState((s) => ({
          ...s,
          status: p >= 1 ? "done" : "running",
          progress: p,
          requests,
          correct,
          correctness,
          elapsedSec: Math.round(elapsed / 1000),
          log: newLogs.length ? [...s.log, ...newLogs] : s.log,
        }));

        if (p >= 1) stop();
      }, 90);
    },
    [stop]
  );

  useEffect(() => stop, [stop]);

  return { ...state, start, reset };
}
