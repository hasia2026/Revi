import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { EmptyState } from "@/components/ui/EmptyState";
import type { LucideIcon } from "lucide-react";

export async function ModulePlaceholderPage({
  title,
  subtitle,
  icon,
  description,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  description: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  if (!memberRes.data?.business_id) redirect("/setup");

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar title={title} subtitle={subtitle} userName={profileRes.data?.full_name} userEmail={user.email} />
      <div className="flex-1 overflow-y-auto">
        <EmptyState icon={icon} title="Coming soon" description={description} />
      </div>
    </div>
  );
}
