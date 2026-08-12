"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatRelativeTime } from "@/lib/utils";
import {
  Plus, Search, Filter, Users, MoreHorizontal, Trash2, Eye,
} from "lucide-react";
import type { Lead } from "@/types/database";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "converted", label: "Converted" },
  { value: "lost", label: "Lost" },
];

const STATUS_MAP: Record<string, "default" | "success" | "warning" | "danger" | "gold" | "info"> = {
  new: "gold",
  contacted: "info",
  qualified: "success",
  converted: "success",
  lost: "danger",
};

interface LeadsTableProps {
  leads: Lead[];
  businessId: string;
}

export function LeadsTable({ leads: initialLeads, businessId }: LeadsTableProps) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("new") === "1") setAddOpen(true);
  }, [searchParams]);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", status: "new",
    source: "", notes: "", service_interest: "",
  });
  const [saving, setSaving] = useState(false);

  const filtered = leads.filter((l) => {
    const matchSearch = l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) || false;
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleCreate() {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("leads")
      .insert({
        business_id: businessId,
        full_name: form.name,
        email: form.email || null,
        phone: form.phone || null,
        status: form.status,
        source: form.source || undefined,
        notes: form.notes || null,
      })
      .select()
      .single();

    if (error) { toast.error(error.message); setSaving(false); return; }
    setLeads((prev) => [data, ...prev]);
    setAddOpen(false);
    setForm({ name: "", email: "", phone: "", status: "new", source: "", notes: "", service_interest: "" });
    toast.success("Lead added");
    setSaving(false);
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setLeads((prev) => prev.filter((l) => l.id !== id));
    toast.success("Lead deleted");
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-charcoal-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-charcoal-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white text-charcoal-700"
          >
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-charcoal-500">{filtered.length} lead{filtered.length !== 1 ? "s" : ""}</span>
          <Button variant="gold" size="md" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="card flex-1 flex items-center justify-center">
          <EmptyState
            icon={Users}
            title="No leads found"
            description={search ? "Try a different search term." : "Add your first lead to get started."}
            action={!search ? <Button variant="gold" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add Lead</Button> : undefined}
          />
        </div>
      ) : (
        <div className="card overflow-hidden flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-charcoal-50 border-b border-charcoal-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide hidden lg:table-cell">Source</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-charcoal-500 uppercase tracking-wide hidden lg:table-cell">Added</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-charcoal-50/50 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={lead.full_name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-charcoal-800 truncate">{lead.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <p className="text-charcoal-600 truncate">{lead.email || "—"}</p>
                    <p className="text-xs text-charcoal-400">{lead.phone || ""}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <Badge variant={STATUS_MAP[lead.status] ?? "default"}>
                      {lead.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-charcoal-500">
                    {lead.source || "—"}
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell text-charcoal-400 text-xs">
                    {formatRelativeTime(lead.created_at)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/leads/${lead.id}`}>
                        <button className="p-1.5 rounded hover:bg-charcoal-100 text-charcoal-400 hover:text-charcoal-700 transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Lead" size="md">
        <div className="space-y-4">
          <Input label="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Smith" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
            <Input label="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} />
            <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Website, referral…" />
          </div>
          <Input label="Service interest" value={form.service_interest} onChange={(e) => setForm({ ...form, service_interest: e.target.value })} placeholder="Haircut, massage…" />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes…" rows={3} />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleCreate} loading={saving} className="flex-1">Add Lead</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
