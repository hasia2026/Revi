import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { CourseLessons } from "@/components/training/CourseLessons";

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);

  const businessId = memberRes.data?.business_id;
  if (!businessId) redirect("/setup");

  // Enforce business-scoped access: only fetch this course if it belongs to the user's business
  const { data: course } = await supabase
    .from("training_courses")
    .select("*")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!course) notFound();

  // Lessons are scoped via the verified course — no cross-tenant leak
  const { data: lessons } = await supabase
    .from("training_lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title={course.title}
        subtitle="Training course"
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <CourseLessons course={course} lessons={lessons ?? []} />
    </div>
  );
}
