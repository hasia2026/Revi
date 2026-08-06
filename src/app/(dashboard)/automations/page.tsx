import { Zap } from "lucide-react";
import { ModulePlaceholderPage } from "@/components/shared/ModulePlaceholderPage";

export default function AutomationsPage() {
  return (
    <ModulePlaceholderPage
      title="Automations"
      subtitle="Rules that run the business without you"
      icon={Zap}
      description="Automations will be the execution layer that acts on what Capture routes and Growth surfaces. Not started yet."
    />
  );
}
