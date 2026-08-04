import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { ConversationsList } from "@/components/conversations/ConversationsList";

export default async function ConversationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const { data: conversations } = await supabase
    .from("conversations")
    .select("*, leads(name, email)")
    .eq("business_id", businessId)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Conversations"
        subtitle="All your customer conversations"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <ConversationsList conversations={conversations ?? []} businessId={businessId} />
    </div>
  );
}
