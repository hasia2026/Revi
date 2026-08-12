import { FlaskConical, Lightbulb, Beaker, Rocket, Star } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function InnovationLabPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "innovation-lab",
    title: "Innovation Lab",
    description: "A space for testing new ideas before they become part of the core platform.",
    icon: FlaskConical,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Innovation Coach", tagline: "Helps shape and test new ideas" },
    overviewCards: [
      { label: "Ideas", value: "0", icon: Lightbulb },
      { label: "In Testing", value: "0", icon: Beaker },
      { label: "Graduated", value: "0", icon: Rocket },
      { label: "Success Rate", value: "—", icon: Star },
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
        icon={FlaskConical}
        title="Innovation Lab isn't built yet"
        description="A future space for testing new ideas before they graduate into the core CUE platform."
      />
    </ModuleFramework>
  );
}
