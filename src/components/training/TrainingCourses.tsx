"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { GraduationCap, Plus, BookOpen, Trash2 } from "lucide-react";
import type { TrainingCourse } from "@/types/database";

type CourseWithLessons = TrainingCourse & { training_lessons: { id: string }[] };

export function TrainingCourses({ courses: initial, businessId }: { courses: CourseWithLessons[]; businessId: string }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("training_courses")
      .insert({
        business_id: businessId,
        title_en: form.title,
        description_en: form.description || null,
        active: true,
      })
      .select("*, training_lessons(id)")
      .single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setCourses((prev) => [...prev, data]);
    setAddOpen(false);
    setForm({ title: "", description: "" });
    toast.success("Course created");
    setSaving(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("training_courses").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setCourses((prev) => prev.filter((c) => c.id !== id));
    toast.success("Course deleted");
  }

  async function togglePublish(course: CourseWithLessons) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("training_courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id)
      .select("*, training_lessons(id)")
      .single();
    if (error) { toast.error(error.message); return; }
    setCourses((prev) => prev.map((c) => c.id === course.id ? data : c));
    toast.success(data.is_published ? "Course published" : "Course unpublished");
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-charcoal-500">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        <Button variant="gold" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={GraduationCap}
            title="No training courses yet"
            description="Create your first course to start training your team."
            action={<Button variant="gold" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> New Course</Button>}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div key={course.id} className="card-hover group">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="h-11 w-11 rounded-xl bg-gold-50 border border-gold-100 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-5 w-5 text-gold-500" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-charcoal-900 mb-1 line-clamp-2">{course.title_en}</h3>
                {course.description_en && (
                  <p className="text-sm text-charcoal-500 line-clamp-2 mb-3">{course.description_en}</p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-xs text-charcoal-500">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{course.training_lessons.length} lesson{course.training_lessons.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="ml-auto">
                    <Badge variant={course.is_published ? "success" : "default"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-charcoal-100">
                <Link href={`/training/${course.id}`} className="flex-1 text-center py-2.5 text-xs font-medium text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50 transition-colors rounded-bl-xl">
                  View lessons
                </Link>
                <div className="w-px bg-charcoal-100" />
                <button
                  onClick={() => togglePublish(course)}
                  className="flex-1 text-center py-2.5 text-xs font-medium text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50 transition-colors rounded-br-xl"
                >
                  {course.is_published ? "Unpublish" : "Publish"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Course" size="sm">
        <div className="space-y-4">
          <Input label="Course title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Customer Service Excellence" />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What will employees learn?" rows={3} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleCreate} loading={saving} className="flex-1">Create Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
