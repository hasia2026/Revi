import { BarChart3 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ReactNode } from "react";

export function ModuleAnalytics({ children }: { children?: ReactNode }) {
  return (
    <section className="bg-white border border-charcoal-100 rounded-xl">
      <div className="px-5 py-4 border-b border-charcoal-100">
        <h2 className="text-sm font-semibold text-charcoal-800">Analytics</h2>
      </div>
      {children ?? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Charts, health scores, and forecasts will appear here once this module has data to work with."
        />
      )}
    </section>
  );
}
