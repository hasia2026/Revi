import { Sparkles, MessageSquare, Users, Star } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function MascotStudioPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "mascot-studio",
    title: "Mascot Studio",
    description: "Your business's AI Ambassador — generated from Company Compass, Brand Voice, Knowledge, and Training.",
    icon: Sparkles,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Ambassador Designer", tagline: "Shapes your business's AI Ambassador" },
    overviewCards: [
      { label: "Conversations", value: "0", icon: MessageSquare },
      { label: "Customers Served", value: "0", icon: Users },
      { label: "Satisfaction", value: "—", icon: Star },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
      { label: "Knowledge", href: "/knowledge", relation: "upstream" },
      { label: "Training", href: "/training", relation: "upstream" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Sparkles}
        title="Mascot Studio isn't built yet"
        description="Every business will get its own AI Ambassador here, generated from Company Compass. Needs Compass populated first — did not exist anywhere in this codebase before the CUE reorg."
      />
    </ModuleFramework>
  );
}
