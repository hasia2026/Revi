import { PlayCircle, CheckCircle2, Clock, ListChecks, Gauge } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function ExecutePage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "execute",
    title: "Execute",
    description: "Where enhancements become real work — tasks, ownership, and follow-through.",
    icon: PlayCircle,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Operations Manager", tagline: "Keeps execution on track" },
    overviewCards: [
      { label: "Open Tasks", value: "0", icon: ListChecks },
      { label: "In Progress", value: "0", icon: Clock },
      { label: "Completed", value: "0", icon: CheckCircle2 },
      { label: "On-Time Rate", value: "—", icon: Gauge },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Enhance", href: "/enhance", relation: "upstream" },
      { label: "Expand", href: "/expand", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={PlayCircle}
        title="Execute isn't built yet"
        description="This module will turn Enhance's recommendations into tracked, owned work."
      />
    </ModuleFramework>
  );
}
