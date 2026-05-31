import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiCallout({
  children,
  title = "AI Analysis",
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-[#bc8cff]/30 bg-[#bc8cff]/[0.06] p-3",
        className
      )}
    >
      <div className="mb-1.5 flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-[#bc8cff]" />
        <span className="text-xs font-semibold text-[#bc8cff]">{title}</span>
      </div>
      <div className="text-xs leading-relaxed text-text-primary/90">
        {children}
      </div>
    </div>
  );
}
