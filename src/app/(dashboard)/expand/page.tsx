import { Rocket, TrendingUp, Users, DollarSign, Target } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function ExpandPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "expand",
    title: "Expand",
    description: "The growth layer — where completed work compounds into new opportunity.",
    icon: Rocket,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Growth Advisor", tagline: "Spots where to grow next" },
    overviewCards: [
      { label: "Growth Opportunities", value: "0", icon: TrendingUp },
      { label: "New Reach", value: "0", icon: Users },
      { label: "Revenue Impact", value: "—", icon: DollarSign },
      { label: "Growth Score", value: "—", icon: Target },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Execute", href: "/execute", relation: "upstream" },
      { label: "Growth (Scal3)", href: "/growth", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Rocket}
        title="Expand isn't built yet"
        description="This module will surface growth opportunities that come out of completed execution."
      />
    </ModuleFramework>
  );
}
