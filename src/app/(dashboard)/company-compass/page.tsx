import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { CompanyCompassDemo } from "@/components/company-compass/CompanyCompassDemo";

export default async function CompanyCompassPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("business_members")
      .select("business_id, businesses(name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);

  if (!memberRes.data?.business_id) redirect("/setup");

  const business = memberRes.data.businesses as unknown as { name: string } | null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar
        title="Company Compass"
        subtitle={business?.name ? `Business intelligence for ${business.name}` : "Your business. Your intelligence."}
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <div className="flex-1 overflow-y-auto bg-charcoal-50 p-6">
        <CompanyCompassDemo />
      </div>
    </div>
  );
}
