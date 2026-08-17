import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Every CU³ module page needs the same three things before it can render:
 * a logged-in user, their business, and a redirect if either is missing.
 * Centralized here so that logic lives in one place, not copy-pasted into
 * every module page the way earlier placeholder pages did.
 */
export async function getModulePageContext() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("business_members")
    .select("business_id, businesses(name, timezone)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!member?.business_id) redirect("/setup");

  // Normalize the joined relation: can be an object or a one-element array
  const business = Array.isArray(member.businesses)
    ? member.businesses[0]
    : member.businesses;
  const businessName = (business as unknown as { name: string } | null)?.name;
  const timezone = (business as unknown as { timezone: string } | null)?.timezone || "UTC";

  return { user, businessId: member.business_id, businessName, timezone };
}
