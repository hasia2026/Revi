import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get profile + business in parallel
  const [profileRes, businessRes] = await Promise.all([
    supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).single(),
    supabase
      .from("business_members")
      .select("businesses(id, name)")
      .eq("user_id", user.id)
      .limit(1)
      .single(),
  ]);

  const profile = profileRes.data;
  const business = (businessRes.data?.businesses as unknown as { id: string; name: string } | null);

  return (
    <div className="flex h-screen overflow-hidden bg-charcoal-50">
      <Sidebar
        userEmail={user.email}
        userName={profile?.full_name}
        businessName={business?.name}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
