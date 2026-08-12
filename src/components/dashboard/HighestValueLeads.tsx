import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { scoreLeadValue, urgencyLabel } from "@/lib/cu3/lead-scoring";
import type { Lead } from "@/types/database";

export function HighestValueLeads({ leads, newCount }: { leads: Lead[]; newCount: number }) {
  const scored = [...leads]
    .map((lead) => ({ lead, score: scoreLeadValue(lead) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
        <div>
          <h3 className="font-semibold text-charcoal-900 text-sm">Highest-Value Leads</h3>
          <p className="text-xs text-charcoal-400 mt-0.5">{newCount} new · who to contact first</p>
        </div>
        <Link href="/leads" className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {scored.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No leads yet" description="Leads worth prioritizing will show up here." />
      ) : (
        <ul className="divide-y divide-charcoal-50">
          {scored.map(({ lead, score }) => {
            const urgency = urgencyLabel(lead);
            return (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-charcoal-50/50 transition-colors">
                  <Avatar name={lead.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800 truncate">{lead.full_name}</p>
                    <p className="text-xs text-charcoal-400 truncate">{lead.service_address || lead.notes || "No details yet"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={urgency.tone}>{urgency.label}</Badge>
                    <span className="text-xs text-charcoal-400">{score}/100</span>
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
