import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Users, ArrowRight } from "lucide-react";
import type { Lead } from "@/types/database";

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "gold" | "info" }> = {
  new: { label: "New", variant: "gold" },
  contacted: { label: "Contacted", variant: "info" },
  qualified: { label: "Qualified", variant: "success" },
  lost: { label: "Lost", variant: "danger" },
  converted: { label: "Converted", variant: "success" },
};

export function RecentLeads({ leads }: { leads: Lead[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
        <h3 className="font-semibold text-charcoal-900 text-sm">Recent Leads</h3>
        <Link href="/leads" className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {leads.length === 0 ? (
        <EmptyState icon={Users} title="No leads yet" description="Leads will appear here as they come in." />
      ) : (
        <ul className="divide-y divide-charcoal-50">
          {leads.map((lead) => {
            const status = STATUS_MAP[lead.status] ?? { label: lead.status, variant: "default" as const };
            return (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-charcoal-50/50 transition-colors">
                  <Avatar name={lead.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800 truncate">{lead.full_name}</p>
                    <p className="text-xs text-charcoal-400 truncate">{lead.email || lead.phone || "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={status.variant}>{status.label}</Badge>
                    <span className="text-xs text-charcoal-400">{formatRelativeTime(lead.created_at)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
