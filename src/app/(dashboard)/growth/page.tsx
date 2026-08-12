import { TrendingUp, DollarSign, Target, Users, LineChart } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function GrowthPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "growth",
    title: "Growth",
    description: "Revenue intelligence, powered by Scal3 — kept as a separate implementation for now.",
    icon: TrendingUp,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Growth Advisor", tagline: "Surfaces revenue opportunities" },
    overviewCards: [
      { label: "Opportunities", value: "0", icon: Target },
      { label: "Pipeline Value", value: "—", icon: DollarSign },
      { label: "Active Leads", value: "0", icon: Users },
      { label: "Conversion", value: "—", icon: LineChart },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Expand", href: "/expand", relation: "upstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={TrendingUp}
        title="Growth integration not connected yet"
        description="This module reserves CUE's nav slot for Scal3's revenue intelligence. The two platforms have separate databases today — merging them is a deliberate future decision, not a side effect of this reorg."
      />
    </ModuleFramework>
  );
}
