import { AppStoreProvider, useStore } from "@/store/AppStore";
import { TopNav } from "@/components/TopNav";
import { Dashboard } from "@/screens/Dashboard";
import { Collections } from "@/screens/Collections";
import { WorkflowBuilder } from "@/screens/WorkflowBuilder";
import { LoadResults } from "@/screens/LoadResults";
import { Compare } from "@/screens/Compare";

function Shell() {
  const { screen } = useStore();
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text-primary">
      <TopNav />
      <main className="flex-1">
        {screen === "dashboard" && <Dashboard />}
        {screen === "collections" && <Collections />}
        {screen === "workflow" && <WorkflowBuilder />}
        {screen === "load" && <LoadResults />}
        {screen === "compare" && <Compare />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <Shell />
    </AppStoreProvider>
  );
}
