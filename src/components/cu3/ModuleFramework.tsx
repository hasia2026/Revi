"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { ModuleConfig } from "@/lib/cu3/module-framework";
import { ModuleHero } from "./sections/ModuleHero";
import { ModuleOverview } from "./sections/ModuleOverview";
import { ModuleAIAssistant } from "./sections/ModuleAIAssistant";
import { ModuleQuickActions } from "./sections/ModuleQuickActions";
import { ModuleWorkspace } from "./sections/ModuleWorkspace";
import { ModuleInsights } from "./sections/ModuleInsights";
import { ModuleAnalytics } from "./sections/ModuleAnalytics";
import { ModuleRelatedModules } from "./sections/ModuleRelatedModules";
import { ModuleActivity } from "./sections/ModuleActivity";

/**
 * Renders the fixed CU³ section order: Hero, Overview, AI Assistant (entry
 * point in hero + slide-over), Quick Actions, Workspace, Insights,
 * Analytics, Related Modules, Activity.
 *
 * A module page supplies a ModuleConfig plus its Workspace content as
 * children. Everything else is guaranteed by this component — a new
 * module cannot accidentally skip a section or reorder the framework,
 * which is the whole point of it being a framework and not a convention
 * every page has to remember to follow.
 */
export function ModuleFramework({ config, children }: { config: ModuleConfig; children: ReactNode }) {
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
      <ModuleHero config={config} onOpenAssistant={() => setAssistantOpen(true)} />
      <ModuleOverview cards={config.overviewCards} />
      <ModuleQuickActions actions={config.quickActions} />
      <ModuleWorkspace>{children}</ModuleWorkspace>
      <ModuleInsights insights={config.insights} />
      <ModuleAnalytics>{config.analytics}</ModuleAnalytics>
      <ModuleRelatedModules modules={config.relatedModules} />
      <ModuleActivity items={config.activity} />

      <ModuleAIAssistant
        persona={config.aiAssistant}
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}
