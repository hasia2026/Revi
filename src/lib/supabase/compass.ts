import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Defined locally rather than in src/types/database.ts on purpose: this
 * keeps Company Compass decoupled from that file's churn (it's been the
 * source of two prior schema-drift bugs in this project) and from needing
 * a coordinated patch against a file whose exact state has proven hard to
 * track reliably during manual mobile deploys. If database.ts is ever
 * regenerated from the live schema, this can be pointed at that instead.
 */
export type CompanyCompass = {
  business_id: string;
  vision: string | null;
  mission: string | null;
  constitution: string | null;
  core_values: string[];
  company_story: string | null;
  customer_promise: string | null;
  employee_promise: string | null;
  leadership_principles: string[];
  brand_voice: string | null;
  elevator_pitch: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Company Compass is the upstream source of truth for a business's identity.
 * Any module that generates brand-facing content (Website Builder, Marketing,
 * Mascot Studio / AI Ambassador) should read through this function rather
 * than querying `company_compass` directly — it's the one place that knows
 * what "complete enough to generate from" means, so that definition can
 * evolve in one spot as more consumers come online.
 *
 * Returns null if no compass row exists yet (business hasn't started one).
 */
export async function getCompanyCompass(
  supabase: SupabaseClient,
  businessId: string
): Promise<CompanyCompass | null> {
  const { data } = await supabase
    .from("company_compass")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  return data;
}

/**
 * Minimum bar for "usable by a generation prompt" — deliberately loose for
 * now (just needs an identity anchor and a voice). Tighten this as real
 * consumers (Website Builder, Mascot Studio) come online and learn what
 * they actually need.
 */
export function isCompassReadyForGeneration(compass: CompanyCompass | null): boolean {
  if (!compass) return false;
  return Boolean(compass.mission && compass.brand_voice);
}

/**
 * Assembles compass fields into a single prompt-ready block of context.
 * This is the seam where AI Gateway / Language Engine hooks in later —
 * every generation-consuming module should build its prompt through this
 * function rather than hand-rolling its own compass-to-text logic.
 */
export function compassToPromptContext(compass: CompanyCompass): string {
  const lines: string[] = [];
  if (compass.mission) lines.push(`Mission: ${compass.mission}`);
  if (compass.vision) lines.push(`Vision: ${compass.vision}`);
  if (compass.brand_voice) lines.push(`Brand voice: ${compass.brand_voice}`);
  if (compass.elevator_pitch) lines.push(`Elevator pitch: ${compass.elevator_pitch}`);
  if (compass.customer_promise) lines.push(`Customer promise: ${compass.customer_promise}`);
  if (compass.core_values.length > 0) lines.push(`Core values: ${compass.core_values.join(", ")}`);
  if (compass.company_story) lines.push(`Company story: ${compass.company_story}`);
  return lines.join("\n");
}
