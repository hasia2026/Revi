import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentLeads } from "@/components/dashboard/RecentLeads";
import { RecentConversations } from "@/components/dashboard/RecentConversations";
import { Users, MessageSquare, BookOpen, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id, businesses(name)").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  const businessName = (memberRes.data?.businesses as unknown as { name: string } | null)?.name;

  if (!businessId) redirect("/setup");

  const [leadsRes, convsRes, articlesRes, coursesRes] = await Promise.all([
    supabase.from("leads").select("id, status", { count: "exact" }).eq("business_id", businessId),
    supabase.from("conversations").select("id, status", { count: "exact" }).eq("business_id", businessId),
    supabase.from("knowledge_articles").select("id", { count: "exact" }).eq("business_id", businessId),
    supabase.from("training_courses").select("id", { count: "exact" }).eq("business_id", businessId),
  ]);

  const totalLeads = leadsRes.count ?? 0;
  const newLeads = leadsRes.data?.filter((l) => l.status === "new").length ?? 0;
  const openConvs = convsRes.data?.filter((c) => c.status === "open").length ?? 0;
  const totalConvs = convsRes.count ?? 0;
  const totalArticles = articlesRes.count ?? 0;
  const totalCourses = coursesRes.count ?? 0;

  const [recentLeadsRes, recentConvsRes] = await Promise.all([
    supabase.from("leads").select("id, full_name, email, phone, status, source, created_at").eq("business_id", businessId).order("created_at", { ascending: false }).limit(5),
    supabase.from("conversations").select("id, status, subject, updated_at, leads(full_name)").eq("business_id", businessId).order("updated_at", { ascending: false }).limit(5),
  ]);

  const userName = profileRes.data?.full_name;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={`Good ${getGreeting()}, ${userName?.split(" ")[0] || "there"} 👋`}
        subtitle={businessName ? `Managing ${businessName}` : undefined}
        userName={userName}
        userEmail={user.email}
      />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Leads" value={totalLeads} sub={`${newLeads} new`} icon={Users} color="gold" />
          <StatCard label="Conversations" value={totalConvs} sub={`${openConvs} open`} icon={MessageSquare} color="blue" />
          <StatCard label="Articles" value={totalArticles} sub="in knowledge base" icon={BookOpen} color="green" />
          <StatCard label="Courses" value={totalCourses} sub="training courses" icon={TrendingUp} color="purple" />
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentLeads leads={(recentLeadsRes.data ?? []) as unknown as Parameters<typeof RecentLeads>[0]["leads"]} />
          <RecentConversations conversations={(recentConvsRes.data ?? []) as unknown as Parameters<typeof RecentConversations>[0]["conversations"]} />
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
