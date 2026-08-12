import { Users2, UserPlus, GraduationCap, Award, Heart } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function PeoplePage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "people",
    title: "People",
    description: "Team, roles, and growth — the human side of the operating system.",
    icon: Users2,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Team Assistant", tagline: "Helps manage and grow the team" },
    overviewCards: [
      { label: "Team Members", value: "0", icon: UserPlus },
      { label: "In Training", value: "0", icon: GraduationCap },
      { label: "Certified", value: "0", icon: Award },
      { label: "Engagement", value: "—", icon: Heart },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Training", href: "/training", relation: "downstream" },
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Users2}
        title="People isn't built yet"
        description="Team management currently lives under Settings → Team. This module will eventually replace that with a full People workspace."
      />
    </ModuleFramework>
  );
}
