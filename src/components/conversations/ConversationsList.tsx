"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { formatRelativeTime } from "@/lib/utils";
import { MessageSquare, Plus, Search } from "lucide-react";
import { useRouter } from "next/navigation";

const CHANNEL_ICONS: Record<string, string> = {
  email: "✉️", sms: "💬", chat: "💭", phone: "📞", whatsapp: "🟢",
};

const CHANNEL_OPTIONS = [
  { value: "chat", label: "Chat" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
];

const STATUS_MAP: Record<string, "default" | "success" | "info" | "warning" | "danger"> = {
  open: "info", resolved: "success", pending: "warning", closed: "default",
};

interface ConvRow {
  id: string;
  status: string;
  subject: string | null;
  updated_at: string;
  created_at: string;
  leads: { full_name: string; email: string | null } | null;
}

export function ConversationsList({ conversations: initial, businessId }: { conversations: ConvRow[]; businessId: string }) {
  const router = useRouter();
  const [convs, setConvs] = useState(initial);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.get("new") === "1") setAddOpen(true);
  }, [searchParams]);
  const [form, setForm] = useState({ channel: "chat", subject: "", status: "open" });
  const [saving, setSaving] = useState(false);

  const filtered = convs.filter((c) => {
    const name = c.leads?.full_name ?? c.subject ?? "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleCreate() {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("conversations")
      .insert({ business_id: businessId, subject: form.subject || null, status: form.status })
      .select("*, leads(full_name, email)")
      .single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setConvs((prev) => [data, ...prev]);
    setAddOpen(false);
    setForm({ channel: "chat", subject: "", status: "open" });
    toast.success("Conversation created");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex-1 flex min-h-0">
      {/* Sidebar list */}
      <div className="w-full max-w-sm border-r border-charcoal-100 flex flex-col bg-white">
        {/* Search + filter */}
        <div className="p-4 border-b border-charcoal-100 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 text-sm border border-charcoal-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gold-400 bg-white text-charcoal-700"
            >
              <option value="all">All</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <Button variant="gold" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> New
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <EmptyState icon={MessageSquare} title="No conversations" description="Start a new conversation." />
          ) : (
            <ul className="divide-y divide-charcoal-50">
              {filtered.map((conv) => (
                <li key={conv.id}>
                  <Link href={`/conversations/${conv.id}`} className="flex items-start gap-3 px-4 py-3.5 hover:bg-charcoal-50/70 transition-colors">
                    <div className="h-9 w-9 rounded-lg bg-charcoal-100 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                      💬
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-charcoal-800 truncate">
                          {conv.leads?.full_name ?? conv.subject ?? "Untitled"}
                        </p>
                        <span className="text-xs text-charcoal-400 flex-shrink-0">
                          {formatRelativeTime(conv.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={STATUS_MAP[conv.status] ?? "default"}>
                          {conv.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Placeholder for detail pane */}
      <div className="flex-1 flex items-center justify-center bg-charcoal-50">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-white border border-charcoal-200 flex items-center justify-center mx-auto mb-4 shadow-card">
            <MessageSquare className="h-8 w-8 text-charcoal-300" />
          </div>
          <p className="text-charcoal-500 font-medium">Select a conversation</p>
          <p className="text-sm text-charcoal-400 mt-1">Choose one from the list to view messages</p>
        </div>
      </div>

      {/* New conversation modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New Conversation" size="sm">
        <div className="space-y-4">
          <Select
            label="Channel"
            value={form.channel}
            onChange={(e) => setForm({ ...form, channel: e.target.value })}
            options={CHANNEL_OPTIONS}
          />
          <Input
            label="Subject (optional)"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder="What's this about?"
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={handleCreate} loading={saving} className="flex-1">Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
