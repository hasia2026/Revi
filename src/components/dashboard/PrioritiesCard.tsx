"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Pin, Check, Trash2, User, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Priority } from "@/lib/cu3/dashboard-types";

type Member = { user_id: string; name: string };

export function PrioritiesCard({
  businessId,
  initialPriorities,
  members,
  currentUserId,
}: {
  businessId: string;
  initialPriorities: Priority[];
  members: Member[];
  currentUserId: string;
}) {
  const [priorities, setPriorities] = useState(initialPriorities);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", due_date: "", assigned_to: "" });

  const openItems = priorities
    .filter((p) => p.status === "open")
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    });

  async function handleCreate() {
    if (!form.title.trim()) { toast.error("Title required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("priorities")
      .insert({
        business_id: businessId,
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
        assigned_to: form.assigned_to || null,
        source: "user",
        created_by: currentUserId,
      })
      .select()
      .single();

    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setPriorities((prev) => [data, ...prev]);
    setOpen(false);
    setForm({ title: "", description: "", due_date: "", assigned_to: "" });
    toast.success("Priority added");
  }

  async function toggleComplete(priority: Priority) {
    const next = priority.status === "open" ? "complete" : "open";
    setPriorities((prev) => prev.map((p) => (p.id === priority.id ? { ...p, status: next } : p)));
    const supabase = createClient();
    const { error } = await supabase.from("priorities").update({ status: next }).eq("id", priority.id);
    if (error) {
      toast.error(error.message);
      setPriorities((prev) => prev.map((p) => (p.id === priority.id ? { ...p, status: priority.status } : p)));
    }
  }

  async function togglePin(priority: Priority) {
    const next = !priority.pinned;
    setPriorities((prev) => prev.map((p) => (p.id === priority.id ? { ...p, pinned: next } : p)));
    const supabase = createClient();
    const { error } = await supabase.from("priorities").update({ pinned: next }).eq("id", priority.id);
    if (error) {
      toast.error(error.message);
      setPriorities((prev) => prev.map((p) => (p.id === priority.id ? { ...p, pinned: priority.pinned } : p)));
    }
  }

  async function handleDelete(id: string) {
    const prev = priorities;
    setPriorities((p) => p.filter((item) => item.id !== id));
    const supabase = createClient();
    const { error } = await supabase.from("priorities").delete().eq("id", id);
    if (error) { toast.error(error.message); setPriorities(prev); }
  }

  function assigneeName(userId: string | null) {
    if (!userId) return null;
    return members.find((m) => m.user_id === userId)?.name ?? "Someone";
  }

  return (
    <div className="glass-panel rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h3 className="font-semibold text-white text-sm">Today&apos;s Priorities</h3>
          <p className="text-xs text-charcoal-400 mt-0.5">{openItems.length} open</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {openItems.length === 0 ? (
        <EmptyState
          icon={Check}
          title="Nothing on your plate"
          description="Add a priority manually, or check back once CUE can recommend some."
          action={<Button size="sm" onClick={() => setOpen(true)}>Add a priority</Button>}
          dark
        />
      ) : (
        <ul className="divide-y divide-white/5">
          {openItems.map((priority) => (
            <li key={priority.id} className="flex items-start gap-3 px-5 py-3.5 group">
              <button
                onClick={() => toggleComplete(priority)}
                className="mt-0.5 h-5 w-5 rounded-full border-2 border-white/20 hover:border-cue-blue-400 flex-shrink-0 transition-colors"
                aria-label="Mark complete"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-white">{priority.title}</p>
                  <Badge variant={priority.source === "cue" ? "cue" : "default"} size="sm">
                    {priority.source === "cue" ? "Recommended by CUE" : "Added by you"}
                  </Badge>
                </div>
                {priority.description && (
                  <p className="text-xs text-charcoal-500 mt-0.5">{priority.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-charcoal-400">
                  {priority.due_date && (
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{priority.due_date}</span>
                  )}
                  {priority.assigned_to && (
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{assigneeName(priority.assigned_to)}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => togglePin(priority)}
                  className={cn("p-1.5 rounded-md hover:bg-white/10", priority.pinned ? "text-cue-orange-400" : "text-charcoal-500")}
                  title="Pin"
                >
                  <Pin className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(priority.id)}
                  className="p-1.5 rounded-md text-charcoal-500 hover:bg-red-500/10 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add priority" size="sm">
        <div className="space-y-3">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Follow up with Patriot Electric" autoFocus />
          <Input label="Description (optional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Due date" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <Select
              label="Assign to"
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              options={members.map((m) => ({ value: m.user_id, label: m.name }))}
              placeholder="Unassigned"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving}>Add priority</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
