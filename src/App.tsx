import { useState } from "react";
import { TopNav } from "@/components/TopNav";
import { Dashboard } from "@/screens/Dashboard";
import { WorkflowBuilder } from "@/screens/WorkflowBuilder";
import { LoadResults } from "@/screens/LoadResults";
import { Compare } from "@/screens/Compare";

export type ScreenId = "dashboard" | "workflow" | "load" | "compare";

export default function App() {
  const [screen, setScreen] = useState<ScreenId>("dashboard");

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-primary">
      <TopNav active={screen} onNavigate={setScreen} />
      <main className="flex-1">
        {screen === "dashboard" && <Dashboard onNavigate={setScreen} />}
        {screen === "workflow" && <WorkflowBuilder />}
        {screen === "load" && <LoadResults />}
        {screen === "compare" && <Compare />}
      </main>
    </div>
  );
}
