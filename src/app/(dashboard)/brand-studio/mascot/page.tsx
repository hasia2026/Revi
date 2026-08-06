import { Sparkles } from "lucide-react";
import { ModulePlaceholderPage } from "@/components/shared/ModulePlaceholderPage";

export default function MascotStudioPage() {
  return (
    <ModulePlaceholderPage
      title="Mascot Studio"
      subtitle="Your business's AI Ambassador"
      icon={Sparkles}
      description="Every business gets its own AI Ambassador, generated from Company Compass, Brand Voice, Knowledge, and Training. Not started yet — needs Compass populated first."
    />
  );
}
