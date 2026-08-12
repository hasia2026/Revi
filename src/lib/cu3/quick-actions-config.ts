import type { LucideIcon } from "lucide-react";
import { UserPlus, MessageSquarePlus, BookOpen, GraduationCap, Sparkles } from "lucide-react";

/**
 * Quick Actions is a configurable framework, not a hardcoded button row.
 * Each industry config (generic CUE today, Hospitality next) exports its
 * own QuickActionConfig[] from this file's pattern; the component just
 * renders whatever list it's given. Adding an industry means adding a
 * config array here, not touching QuickActions.tsx.
 */

export type QuickActionConfig = {
  label: string;
  icon: LucideIcon;
  href?: string;
  disabledReason?: string;
};

export const GENERIC_QUICK_ACTIONS: QuickActionConfig[] = [
  { label: "Add Lead", icon: UserPlus, href: "/leads?new=1" },
  { label: "Message Customer", icon: MessageSquarePlus, href: "/conversations?new=1" },
  { label: "Add Knowledge", icon: BookOpen, href: "/knowledge?new=1" },
  { label: "Add Training", icon: GraduationCap, href: "/training?new=1" },
  { label: "Ask Revi", icon: Sparkles, disabledReason: "Needs the AI gateway (Phase 2) — not connected yet" },
];

// Hospitality's config is proposed in the architecture audit, not built
// yet — this is the seam it plugs into once approved. Example shape:
// export const HOSPITALITY_QUICK_ACTIONS: QuickActionConfig[] = [
//   { label: "New Guest Request", icon: Bell, href: "/requests?new=1" },
//   { label: "Register Guest", icon: UserPlus, href: "/registration?new=1" },
//   ...
// ];
