import { TrendingUp } from "lucide-react";
import { ModulePlaceholderPage } from "@/components/shared/ModulePlaceholderPage";

export default function GrowthPage() {
  return (
    <ModulePlaceholderPage
      title="Growth"
      subtitle="Revenue intelligence"
      icon={TrendingUp}
      description="Growth is powered by Scal3, kept as a separate implementation for now. This module reserves its place in CUE's navigation ahead of that integration."
    />
  );
}
