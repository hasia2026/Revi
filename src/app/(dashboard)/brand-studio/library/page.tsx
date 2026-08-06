import { LibraryBig } from "lucide-react";
import { ModulePlaceholderPage } from "@/components/shared/ModulePlaceholderPage";

export default function ExecutiveLibraryPage() {
  return (
    <ModulePlaceholderPage
      title="Executive Library"
      subtitle="Presentations and documents built on your brand identity"
      icon={LibraryBig}
      description="A home for pitch decks, one-pagers, and leadership materials generated from Company Compass."
    />
  );
}
