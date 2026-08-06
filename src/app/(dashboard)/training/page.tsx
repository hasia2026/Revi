import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { TrainingCourses } from "@/components/training/TrainingCourses";

export default async function TrainingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  const { data: courses } = await supabase
    .from("training_courses")
    .select("*, training_lessons(id)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="Training"
        subtitle="Courses and lessons for your team"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <TrainingCourses courses={courses ?? []} businessId={businessId} />
    </div>
  );
}
