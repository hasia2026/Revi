"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatDate } from "@/lib/utils";
import { Save, ArrowLeft, Mail, Phone, Calendar, Tag, MessageSquare } from "lucide-react";
import Link from "next/link";
import type { Lead } from "@/types/database";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "quote_sent", label: "Quote Sent" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_MAP: Record<string, "default" | "success" | "warning" | "danger" | "gold" | "info"> = {
  new: "gold", contacted: "info", qualified: "success", quote_sent: "warning", converted: "success", lost: "danger",
};

export function LeadDetail({ lead: initial }: { lead: Lead }) {
  const router = useRouter();
  const [lead, setLead] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: lead.full_name, email: lead.email ?? "", phone: lead.phone ?? "",
    status: lead.status, source: lead.source ?? "", notes: lead.notes ?? "",
  });

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .update({
        full_name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        status: form.status,
        source: form.source || undefined,
        notes: form.notes || null,
      })
      .eq("id", lead.id)
      .select()
      .single();

    if (error) { toast.error(error.message); setSaving(false); return; }
    setLead(data);
    setEditing(false);
    setSaving(false);
    toast.success("Lead updated");
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/leads">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" /> Leads
            </Button>
          </Link>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar name={lead.full_name} size="lg" />
              <div>
                <h2 className="text-xl font-semibold text-charcoal-900">{lead.full_name}</h2>
                <Badge variant={STATUS_MAP[lead.status] ?? "default"} size="md" className="mt-1">
                  {lead.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
                  <Button variant="gold" size="sm" loading={saving} onClick={handleSave}>
                    <Save className="h-4 w-4" /> Save
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit</Button>
              )}
            </div>
          </div>

          {editing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
              </div>
              <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow icon={Mail} label="Email" value={lead.email} />
              <InfoRow icon={Phone} label="Phone" value={lead.phone} />
              <InfoRow icon={Tag} label="Source" value={lead.source} />
              <InfoRow icon={Calendar} label="Added" value={formatDate(lead.created_at)} />
              <InfoRow icon={Calendar} label="Updated" value={formatDate(lead.updated_at)} />
              {lead.notes && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-charcoal-700 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-lg bg-charcoal-50 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-charcoal-400" />
      </div>
      <div>
        <p className="text-xs text-charcoal-400 font-medium">{label}</p>
        <p className="text-sm text-charcoal-800 mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}
