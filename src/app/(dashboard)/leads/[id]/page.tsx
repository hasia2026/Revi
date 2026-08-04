import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { LeadDetail } from "@/components/leads/LeadDetail";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).single(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  // Enforce business-scoped access: only fetch this lead if it belongs to the user's business
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!lead) notFound();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={lead.name}
        subtitle="Lead details"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <LeadDetail lead={lead} />
    </div>
  );
}
