import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * The CU³ Module Framework contract.
 *
 * Every module in CUE — existing or "five years from now" — fills out one
 * of these and hands it to <ModuleFramework>. The framework guarantees
 * section order and layout; the module only supplies content. This is
 * what makes adding a new module (Finance, Legal, Compliance, whatever
 * comes later) a matter of writing a config object, not inventing a page.
 *
 * Sections render in the fixed order the framework defines. A module
 * that has nothing yet for an optional section still gets that section
 * rendered, in a placeholder state — the section existing structurally,
 * even empty, is the point (see docs/Architecture.md's CU³ note).
 */

export type ModuleStatus = "active" | "beta" | "coming-soon";

export type AIAssistantPersona = {
  /** e.g. "Strategic Advisor", "Intake Assistant" */
  name: string;
  /** One line: what this assistant does for the module it lives in */
  tagline: string;
};

export type OverviewCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { direction: "up" | "down" | "flat"; label: string };
};

export type QuickAction = {
  label: string;
  icon: LucideIcon;
  href?: string;
  /**
   * Currently unused by any real page config (verified before this
   * comment was written). If you add one: ModuleQuickActions is a
   * Server Component today, which cannot attach a real onClick handler.
   * Give it the same treatment as ModuleAssistantController - isolate
   * the interactive button into its own small "use client" component
   * that receives only serializable props, not the raw handler mixed
   * in with icon components.
   */
  onClick?: () => void;
};

export type InsightType = "recommendation" | "warning" | "opportunity" | "pattern";

export type Insight = {
  type: InsightType;
  title: string;
  description: string;
};

export type RelatedModuleLink = {
  label: string;
  href: string;
  /** Where this module sits relative to the one it's linked from. */
  relation: "upstream" | "downstream" | "compass";
};

export type ActivityItem = {
  id: string;
  description: string;
  timestamp: string;
  actor?: string;
};

export type ModuleConfig = {
  /** Stable identifier, e.g. "capture", "understand". Used for keys/analytics later. */
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: ModuleStatus;
  aiAssistant: AIAssistantPersona;
  overviewCards: OverviewCard[];
  quickActions: QuickAction[];
  insights: Insight[];
  relatedModules: RelatedModuleLink[];
  activity: ActivityItem[];
  /**
   * Charts/KPIs vary too much per module to standardize the shape —
   * this is a slot, not a data contract. Pass undefined for a
   * placeholder state.
   */
  analytics?: ReactNode;
  /** Business context shown in the hero, e.g. the current business name. */
  businessContext?: string;
};
