import { Badge } from "@/components/ui/Badge";
import type { ModuleConfig } from "@/lib/cu3/module-framework";
import type { ReactNode } from "react";

const STATUS_LABEL: Record<ModuleConfig["status"], string> = {
  active: "Active",
  beta: "Beta",
  "coming-soon": "Coming Soon",
};

const STATUS_VARIANT: Record<ModuleConfig["status"], "success" | "gold" | "default"> = {
  active: "success",
  beta: "gold",
  "coming-soon": "default",
};

export function ModuleHero({ config, assistantTrigger }: { config: ModuleConfig; assistantTrigger: ReactNode }) {
  const Icon = config.icon;

  return (
    <section className="bg-white border border-charcoal-100 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-charcoal-900 flex items-center justify-center flex-shrink-0">
            <Icon className="h-6 w-6 text-gold-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-charcoal-900">{config.title}</h1>
              <Badge variant={STATUS_VARIANT[config.status]} size="sm">{STATUS_LABEL[config.status]}</Badge>
            </div>
            <p className="text-sm text-charcoal-500 mt-1 max-w-xl">{config.description}</p>
            {config.businessContext && (
              <p className="text-xs text-charcoal-400 mt-2">{config.businessContext}</p>
            )}
          </div>
        </div>

        {assistantTrigger}
      </div>
    </section>
  );
}
