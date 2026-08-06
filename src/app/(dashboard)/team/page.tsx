import { Users } from "lucide-react";
import { ModulePlaceholderPage } from "@/components/shared/ModulePlaceholderPage";

export default function TeamPage() {
  return (
    <ModulePlaceholderPage
      title="Team"
      subtitle="People and permissions"
      icon={Users}
      description="Team management currently lives under Settings → Team. This top-level module reserves its spot in the new navigation; migrating the working Settings tab here is a follow-up, not done as a side effect of this reorg."
    />
  );
}
