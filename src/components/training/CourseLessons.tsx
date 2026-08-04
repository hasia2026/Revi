"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { BookOpen, Plus, GripVertical, Trash2, ArrowLeft, Play } from "lucide-react";
import type { TrainingCourse, TrainingLesson } from "@/types/database";

export function CourseLessons({ course, lessons: initial }: { course: TrainingCourse; lessons: TrainingLesson[] }) {
  const router = useRouter();
  const [lessons, setLessons] = useState(initial);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", video_url: "", duration: "" });
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("training_lessons")
      .insert({
        course_id: course.id,
        title: form.title,
        content: form.content || null,
        video_url: form.video_url || null,
        duration: form.duration ? Number(form.duration) : null,
        order_index: lessons.length,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setLessons((prev) => [...prev, data]);
    setAddOpen(false);
    setForm({ title: "", content: "", video_url: "", duration: "" });
    toast.success("Lesson added");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("training_lessons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLessons((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lesson deleted");
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/training">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /> Courses</Button>
          </Link>
        </div>

        <div className="card p-5 mb-6">
          <p className="text-sm text-charcoal-600 leading-relaxed">{course.description || "No description."}</p>
          <p className="text-xs text-charcoal-400 mt-2">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-charcoal-800">Lessons</h2>
          <Button variant="gold" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Lesson
          </Button>
        </div>

        {lessons.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={BookOpen}
              title="No lessons yet"
              description="Add lessons to build out this course."
              action={<Button variant="gold" size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Lesson</Button>}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="card p-4 flex items-center gap-4 group">
                <div className="text-charcoal-300 cursor-grab">
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="h-8 w-8 rounded-lg bg-charcoal-100 flex items-center justify-center text-xs font-bold text-charcoal-500 flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-charcoal-800 truncate">{lesson.title}</p>
                  {lesson.duration && (
                    <p className="text-xs text-charcoal-400 flex items-center gap-1 mt-0.5">
                      <Play className="h-3 w-3" /> {lesson.duration} min
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(lesson.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Lesson" size="md">
        <div className="space-y-4">
          <Input label="Lesson title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Handling Difficult Customers" />
          <Input label="Video URL" value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="https://..." />
          <Input label="Duration (minutes)" type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="15" />
          <Textarea label="Content / Notes" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} placeholder="Lesson notes or transcript…" />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleCreate} loading={saving} className="flex-1">Add Lesson</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
