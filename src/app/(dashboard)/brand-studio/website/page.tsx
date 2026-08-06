import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { WebsiteEditor } from "@/components/website/WebsiteEditor";

export default async function WebsitePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id, businesses(name)").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const businessName = (memberRes.data?.businesses as unknown as { name: string } | null)?.name;

  const { data: settings } = await supabase
    .from("website_settings")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Website"
        subtitle="Customize your public-facing website"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <WebsiteEditor settings={settings} businessId={businessId} businessName={businessName ?? ""} />
    </div>
  );
}
