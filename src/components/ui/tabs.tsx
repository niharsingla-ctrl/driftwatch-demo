import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { value: string; label: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Lightweight segmented tab bar used across screens. */
export function Tabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === t.value
              ? "bg-surface-2 text-text-primary"
              : "text-muted hover:text-text-primary"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
