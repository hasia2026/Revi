import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id, role, businesses(*)").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const business = memberRes.data?.businesses as unknown as Record<string, unknown> | null;

  const [servicesRes, membersRes, businessSettingsRes] = await Promise.all([
    supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
    supabase.from("business_members").select("*, profiles(full_name, email, avatar_url)").eq("business_id", businessId),
    supabase.from("business_settings").select("*").eq("business_id", businessId).maybeSingle(),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Settings"
        subtitle="Manage your account and business"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <SettingsPanel
        profile={profileRes.data}
        business={business}
        businessSettings={businessSettingsRes.data}
        businessId={businessId}
        role={memberRes.data?.role ?? "member"}
        services={servicesRes.data ?? []}
        members={membersRes.data ?? []}
        userId={user.id}
        userEmail={user.email ?? ""}
      />
    </div>
  );
}
