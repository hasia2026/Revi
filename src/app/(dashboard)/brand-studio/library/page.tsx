import { LibraryBig, FileText, Presentation, Download } from "lucide-react";
import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import { EmptyState } from "@/components/ui/EmptyState";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";

export default async function ExecutiveLibraryPage() {
  const { businessName } = await getModulePageContext();

  const config: ModuleConfig = {
    key: "executive-library",
    title: "Executive Library",
    description: "Presentations and documents built on your brand identity.",
    icon: LibraryBig,
    status: "coming-soon",
    businessContext: businessName ? `For ${businessName}` : undefined,
    aiAssistant: { name: "Document Assistant", tagline: "Drafts decks and documents from Compass" },
    overviewCards: [
      { label: "Documents", value: "0", icon: FileText },
      { label: "Decks", value: "0", icon: Presentation },
      { label: "Downloads", value: "0", icon: Download },
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
        icon={LibraryBig}
        title="Executive Library isn't built yet"
        description="A future home for pitch decks, one-pagers, and leadership materials generated from Company Compass."
      />
    </ModuleFramework>
  );
}
