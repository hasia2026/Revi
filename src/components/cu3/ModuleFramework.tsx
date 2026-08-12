import type { ModuleConfig } from "@/lib/cu3/module-framework";
import type { ReactNode } from "react";
import { ModuleHero } from "./sections/ModuleHero";
import { ModuleOverview } from "./sections/ModuleOverview";
import { ModuleAssistantController } from "./sections/ModuleAssistantController";
import { ModuleQuickActions } from "./sections/ModuleQuickActions";
import { ModuleWorkspace } from "./sections/ModuleWorkspace";
import { ModuleInsights } from "./sections/ModuleInsights";
import { ModuleAnalytics } from "./sections/ModuleAnalytics";
import { ModuleRelatedModules } from "./sections/ModuleRelatedModules";
import { ModuleActivity } from "./sections/ModuleActivity";

/**
 * A Server Component on purpose. Renders the fixed CU³ section order:
 * Hero, Overview, AI Assistant trigger, Quick Actions, Workspace,
 * Insights, Analytics, Related Modules, Activity.
 *
 * ModuleConfig carries Lucide icon COMPONENTS (functions) in several
 * fields - those are not serializable across a Server->Client Component
 * prop boundary. Every section here except the assistant trigger is a
 * plain Server Component for exactly that reason; the one genuinely
 * interactive piece (opening/closing the assistant panel) is isolated
 * into ModuleAssistantController, which only receives the serializable
 * {name, tagline} persona object, not any part of `config` itself.
 *
 * A module page supplies a ModuleConfig plus its Workspace content as
 * children. Everything else is guaranteed by this component.
 */
export function ModuleFramework({ config, children }: { config: ModuleConfig; children: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      <ModuleHero
        config={config}
        assistantTrigger={<ModuleAssistantController persona={config.aiAssistant} />}
      />
      <ModuleOverview cards={config.overviewCards} />
      <ModuleQuickActions actions={config.quickActions} />
      <ModuleWorkspace>{children}</ModuleWorkspace>
      <ModuleInsights insights={config.insights} />
      <ModuleAnalytics>{config.analytics}</ModuleAnalytics>
      <ModuleRelatedModules modules={config.relatedModules} />
      <ModuleActivity items={config.activity} />
    </div>
  );
}
