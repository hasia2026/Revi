import { Users, UserPlus, Shield, Clock } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function TeamPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "team",
    title: "Team",
    description: "People and permissions — this top-level module's real functionality still lives in Settings for now.",
    icon: Users,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Team Assistant", tagline: "Helps manage roles and permissions" },
    overviewCards: [
      { label: "Team Members", value: "0", icon: UserPlus },
      { label: "Roles", value: "0", icon: Shield },
      { label: "Pending Invites", value: "0", icon: Clock },
    ],
    quickActions: [
      { label: "Manage in Settings", href: "/settings", icon: Users },
    ],
    insights: [],
    relatedModules: [
      { label: "People", href: "/people", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Users}
        title="Team management lives in Settings for now"
        description="Settings → Team has the real, working functionality. This module reserves the nav slot — migrating the working tab here is a deliberate follow-up, not done silently."
      />
    </ModuleFramework>
  );
}
