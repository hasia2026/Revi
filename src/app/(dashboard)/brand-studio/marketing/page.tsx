import { Megaphone, FileText, Send, Eye } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function MarketingPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "marketing",
    title: "Marketing",
    description: "Campaigns and copy generated from your brand identity.",
    icon: Megaphone,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Marketing Assistant", tagline: "Drafts campaigns from your brand voice" },
    overviewCards: [
      { label: "Campaigns", value: "0", icon: FileText },
      { label: "Sent", value: "0", icon: Send },
      { label: "Views", value: "0", icon: Eye },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [
      { label: "Company Compass", href: "/brand-studio/compass", relation: "compass" },
      { label: "Website Builder", href: "/brand-studio/website", relation: "downstream" },
    ],
    activity: [],
  };

  return (
    <ModuleFramework config={config}>
      <EmptyState
        icon={Megaphone}
        title="Marketing isn't built yet"
        description="This module will generate campaigns and copy from Company Compass once that's populated."
      />
    </ModuleFramework>
  );
}
