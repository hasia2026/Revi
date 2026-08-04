import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { KnowledgeBase } from "@/components/knowledge/KnowledgeBase";

export default async function KnowledgePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const [categoriesRes, articlesRes] = await Promise.all([
    supabase.from("knowledge_categories").select("*").eq("business_id", businessId).order("order_index", { ascending: true }),
    supabase.from("knowledge_articles").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
  ]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Knowledge Base"
        subtitle="Articles and documentation for your team"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <KnowledgeBase
        categories={categoriesRes.data ?? []}
        articles={articlesRes.data ?? []}
        businessId={businessId}
      />
    </div>
  );
}
