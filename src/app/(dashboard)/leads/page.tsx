import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { LeadsTable } from "@/components/leads/LeadsTable";

export default async function LeadsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).single(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).single(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Leads"
        subtitle="Manage and track your prospects"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <LeadsTable leads={leads ?? []} businessId={businessId} />
    </div>
  );
}
