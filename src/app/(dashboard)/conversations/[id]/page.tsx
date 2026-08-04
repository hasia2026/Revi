import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ConversationView } from "@/components/conversations/ConversationView";

export default async function ConversationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const memberRes = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  // Enforce business-scoped access: only fetch this conversation if it belongs to the user's business
  const { data: conv } = await supabase
    .from("conversations")
    .select("*, leads(name, email, phone)")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!conv) notFound();

  // Messages are scoped via the verified conversation — no cross-tenant leak
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  return (
    <ConversationView
      conversation={conv}
      messages={messages ?? []}
      currentUserId={user.id}
    />
  );
}
