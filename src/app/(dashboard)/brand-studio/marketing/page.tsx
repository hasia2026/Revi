import { Megaphone } from "lucide-react";
import { ModulePlaceholderPage } from "@/components/shared/ModulePlaceholderPage";

export default function MarketingPage() {
  return (
    <ModulePlaceholderPage
      title="Marketing"
      subtitle="Campaigns generated from your brand identity"
      icon={Megaphone}
      description="Marketing will generate copy and campaigns from Company Compass once that's populated."
    />
  );
}
