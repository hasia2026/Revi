import type { Lead } from "@/types/database";

/**
 * Deterministic "highest value" scoring from data that already exists.
 * This is NOT AI-driven — it's a real, explainable v1 built from status,
 * recency of contact, and whether there's substantive context on the
 * lead. When the Phase 2 AI gateway exists, this can be replaced or
 * supplemented with a model-driven score; until then, this is honest
 * and useful rather than a placeholder pretending to be intelligent.
 */

const STATUS_WEIGHT: Record<string, number> = {
  new: 40,
  contacted: 55,
  qualified: 70,
  quote_sent: 85,
  converted: 20, // already won, no longer needs action
  lost: 0,
};

export function scoreLeadValue(lead: Lead): number {
  let score = STATUS_WEIGHT[lead.status] ?? 30;

  // Staleness penalty: leads that haven't been touched recently lose
  // urgency points, since "highest value" here means "who to contact
  // first," and a lead going cold matters more than one just created.
  const lastTouch = lead.last_contact_at ?? lead.created_at;
  const daysSince = (Date.now() - new Date(lastTouch).getTime()) / 86_400_000;
  if (daysSince > 7) score -= 20;
  else if (daysSince > 3) score -= 10;

  // Substantive context available (notes present) — more likely to be
  // actionable right now rather than needing discovery first.
  if (lead.notes && lead.notes.trim().length > 0) score += 10;
  if (lead.service_address) score += 5;
  if (lead.preferred_date) score += 10;

  return Math.max(0, Math.min(100, score));
}

export function urgencyLabel(lead: Lead): { label: string; tone: "danger" | "warning" | "default" } {
  const lastTouch = lead.last_contact_at ?? lead.created_at;
  const daysSince = (Date.now() - new Date(lastTouch).getTime()) / 86_400_000;

  if (lead.status === "new") return { label: "Not yet contacted", tone: "danger" };
  if (daysSince > 7) return { label: `${Math.floor(daysSince)}d since contact`, tone: "danger" };
  if (daysSince > 3) return { label: `${Math.floor(daysSince)}d since contact`, tone: "warning" };
  return { label: "Recently contacted", tone: "default" };
}
