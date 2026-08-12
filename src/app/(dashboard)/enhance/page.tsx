import { Wand2, Zap, TrendingUp, Target, Gauge } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function EnhancePage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "enhance",
    title: "Enhance",
    description: "Turns understanding into concrete improvements — before anything gets executed.",
    icon: Wand2,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Optimization Coach", tagline: "Suggests improvements before you execute" },
    overviewCards: [
      { label: "Opportunities", value: "0", icon: TrendingUp },
      { label: "In Progress", value: "0", icon: Gauge },
      { label: "Applied", value: "0", icon: Zap },
      { label: "Impact Score", value: "—", icon: Target },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Understand", href: "/understand", relation: "upstream" },
      { label: "Execute", href: "/execute", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Wand2}
        title="Enhance isn't built yet"
        description="This module will turn what Understand surfaces into concrete, actionable improvements."
      />
    </ModuleFramework>
  );
}
