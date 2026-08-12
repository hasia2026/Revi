import { Brain, FileSearch, TrendingUp, AlertCircle, Target } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function UnderstandPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "understand",
    title: "Understand",
    description: "Turns what Capture brings in into patterns, context, and meaning.",
    icon: Brain,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Intelligence Analyst", tagline: "Finds patterns in what's been captured" },
    overviewCards: [
      { label: "Items Analyzed", value: "0", icon: FileSearch },
      { label: "Patterns Found", value: "0", icon: TrendingUp },
      { label: "Open Questions", value: "0", icon: AlertCircle },
      { label: "Confidence Score", value: "—", icon: Target },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Capture", href: "/capture", relation: "upstream" },
      { label: "Enhance", href: "/enhance", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Brain}
        title="Understand isn't built yet"
        description="This module will analyze what Capture brings in and surface patterns, trends, and context for the rest of CUE."
      />
    </ModuleFramework>
  );
}
