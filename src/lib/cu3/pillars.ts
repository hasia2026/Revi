import type { LucideIcon } from "lucide-react";
import { Target, Brain, Wand2, PlayCircle, Rocket, FlaskConical, Compass } from "lucide-react";

/**
 * The approved long-term information architecture for CUE.
 *
 * Company Compass is the center — everything feeds into it, everything
 * comes back out of it. The five pillars (Capture, Understand, Enhance,
 * Execute, Expand) are not peer nav items alongside existing modules;
 * they are the operational categories those modules live inside. A
 * customer thinking "I need to train my team" should land in Execute
 * without needing to know the module is internally called "Training."
 *
 * THIS FILE DOES NOT CHANGE LIVE NAVIGATION. It's the data layer that
 * makes the eventual migration a config change instead of a rewrite —
 * see docs/Roadmap.md for the migration itself, which is intentionally
 * not scheduled yet. The current Sidebar.tsx nav (Home, Customers,
 * Capture, Knowledge, Training, Brand Studio, Growth, Team, Automations,
 * Settings) remains authoritative for what actually renders until that
 * migration is deliberately performed.
 */

export type PillarKey = "capture" | "understand" | "enhance" | "execute" | "expand" | "innovation-lab";

export type Pillar = {
  key: PillarKey;
  label: string;
  icon: LucideIcon;
  description: string;
};

export const PILLARS: Record<PillarKey, Pillar> = {
  capture: {
    key: "capture",
    label: "Capture",
    icon: Target,
    description: "Bring in everything that matters — conversations, documents, emails, forms, imports.",
  },
  understand: {
    key: "understand",
    label: "Understand",
    icon: Brain,
    description: "Turn what's captured into clarity — analysis, insights, reports, Company Compass itself.",
  },
  enhance: {
    key: "enhance",
    label: "Enhance",
    icon: Wand2,
    description: "Elevate brand, content, and experience — Brand Studio, Website Builder, Mascot Studio, Marketing.",
  },
  execute: {
    key: "execute",
    label: "Execute",
    icon: PlayCircle,
    description: "Turn plans into action — Training, Team, Tasks, Workflows, Follow-ups.",
  },
  expand: {
    key: "expand",
    label: "Expand",
    icon: Rocket,
    description: "Scale the business — Scal3, CRM, Automations, Business Intelligence, Integrations.",
  },
  "innovation-lab": {
    key: "innovation-lab",
    label: "Innovation Lab",
    icon: FlaskConical,
    description: "Standalone — a space for testing new ideas before they graduate into a pillar.",
  },
};

export const COMPANY_COMPASS = {
  label: "Company Compass",
  icon: Compass,
  description: "The operating system's brain. Everything feeds into it, everything comes back out of it. Occupies the center, conceptually and visually.",
};

/**
 * Maps every module's stable `key` (see ModuleConfig.key) to the pillar
 * it will eventually live under. A module can appear as its own
 * top-level nav item today and still have a `parentPillar` here — that's
 * the "intact until intentionally migrated" part. When migration
 * happens, the Sidebar reads this map instead of hardcoding groups.
 *
 * Company Compass is deliberately listed under "understand" here (per
 * the approved IA — it's where you'd interact with Compass's analysis
 * surface) while also remaining the conceptual root of the whole tree,
 * shown separately in nav. Both things are true at once; this map only
 * captures the operational-category placement, not the root relationship.
 */
export const MODULE_PILLAR_MAP: Record<string, PillarKey> = {
  // Capture
  capture: "capture",
  leads: "capture",
  conversations: "capture",

  // Understand
  understand: "understand",
  "company-compass": "understand",
  knowledge: "understand",

  // Enhance
  enhance: "enhance",
  "brand-studio": "enhance",
  "website-builder": "enhance",
  "mascot-studio": "enhance",
  marketing: "enhance",
  "executive-library": "enhance",

  // Execute
  execute: "execute",
  training: "execute",
  team: "execute",
  people: "execute",

  // Expand
  expand: "expand",
  growth: "expand",
  automations: "expand",
  "connected-ecosystem": "expand",

  // Standalone
  "innovation-lab": "innovation-lab",
};

/** Every module currently assigned to a given pillar, for building pillar landing pages later. */
export function modulesInPillar(pillar: PillarKey): string[] {
  return Object.entries(MODULE_PILLAR_MAP)
    .filter(([, p]) => p === pillar)
    .map(([moduleKey]) => moduleKey);
}
