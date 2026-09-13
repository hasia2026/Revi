import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { CompassEditor } from "@/components/brand-studio/CompassEditor";
import { getCompanyCompass } from "@/lib/supabase/compass";

export default async function BusinessIdentityPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const compass = await getCompanyCompass(supabase, businessId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Business Identity"
        subtitle="The mission, values, promises, and voice your brand builds from"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <CompassEditor compass={compass} businessId={businessId} />
      </div>
    </div>
  );
}
