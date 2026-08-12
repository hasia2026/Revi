import { Network, Plug, Link2, Shield, Activity } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function ConnectedEcosystemPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "connected-ecosystem",
    title: "Connected Ecosystem",
    description: "How CUE connects to everything else this business runs on.",
    icon: Network,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Ecosystem Navigator", tagline: "Helps connect and manage integrations" },
    overviewCards: [
      { label: "Connections", value: "0", icon: Plug },
      { label: "Active", value: "0", icon: Link2 },
      { label: "Health", value: "—", icon: Shield },
      { label: "Sync Activity", value: "—", icon: Activity },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Network}
        title="Connected Ecosystem isn't built yet"
        description="This module will manage how CUE connects to outside tools and services this business already uses."
      />
    </ModuleFramework>
  );
}
