import { Lightbulb, AlertTriangle, TrendingUp, Repeat } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Insight, InsightType } from "@/lib/cu3/module-framework";

const TYPE_META: Record<InsightType, { icon: typeof Lightbulb; color: string; bg: string; label: string }> = {
  recommendation: { icon: Lightbulb, color: "text-gold-600", bg: "bg-gold-50", label: "Recommendation" },
  warning: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50", label: "Warning" },
  opportunity: { icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", label: "Opportunity" },
  pattern: { icon: Repeat, color: "text-charcoal-600", bg: "bg-charcoal-100", label: "Pattern" },
};

export function ModuleInsights({ insights }: { insights: Insight[] }) {
  return (
    <section className="bg-white border border-charcoal-100 rounded-xl">
      <div className="px-5 py-4 border-b border-charcoal-100">
        <h2 className="text-sm font-semibold text-charcoal-800">Insights</h2>
      </div>
      {insights.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No insights yet"
          description="AI-generated recommendations, warnings, and patterns will show up here as this module gets used."
        />
      ) : (
        <ul className="divide-y divide-charcoal-50">
          {insights.map((insight, i) => {
            const meta = TYPE_META[insight.type];
            const Icon = meta.icon;
            return (
              <li key={i} className="flex gap-3 px-5 py-4">
                <div className={`h-8 w-8 rounded-lg ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${meta.color}`} />
                </div>
                <div>
                  <p className="text-xs font-medium text-charcoal-400">{meta.label}</p>
                  <p className="text-sm font-medium text-charcoal-800 mt-0.5">{insight.title}</p>
                  <p className="text-sm text-charcoal-500 mt-0.5">{insight.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
