import { Zap, PlayCircle, Pause, Activity } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function AutomationsPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "automations",
    title: "Automations",
    description: "Rules that run the business without you — the execution layer for what Capture routes and Growth surfaces.",
    icon: Zap,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Automation Assistant", tagline: "Helps design and monitor automations" },
    overviewCards: [
      { label: "Active Rules", value: "0", icon: PlayCircle },
      { label: "Paused", value: "0", icon: Pause },
      { label: "Runs Today", value: "0", icon: Activity },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Execute", href: "/execute", relation: "upstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Zap}
        title="Automations isn't built yet"
        description="This module will let rules act automatically on what Capture routes and Growth surfaces."
      />
    </ModuleFramework>
  );
}
