import { Inbox, FileInput, Route, CheckCircle2, Clock } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function CapturePage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "capture",
    title: "Capture",
    description: "The business's memory — everything captured should be available to power the rest of CUE.",
    icon: Inbox,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Intake Assistant", tagline: "Helps capture and route what comes in" },
    overviewCards: [
      { label: "Items Captured", value: "0", icon: FileInput },
      { label: "Routed", value: "0", icon: Route },
      { label: "Processed", value: "0", icon: CheckCircle2 },
      { label: "Pending", value: "0", icon: Clock },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Understand", href: "/understand", relation: "downstream" },
      { label: "Knowledge", href: "/knowledge", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Inbox}
        title="Capture isn't built yet"
        description="Capture will become the intake system that routes what comes in toward Knowledge, Training, Company Compass, Customers, and Growth. Foundation only — the routing engine isn't built yet."
      />
    </ModuleFramework>
  );
}
