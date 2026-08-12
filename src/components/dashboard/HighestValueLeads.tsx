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
    <div className="glass-panel rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <div>
          <h3 className="font-semibold text-white text-sm">Highest-Value Leads</h3>
          <p className="text-xs text-charcoal-500 mt-0.5">{newCount} new · who to contact first</p>
        </div>
        <Link href="/leads" className="text-xs text-cue-blue-400 hover:text-cue-blue-300 font-medium flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {scored.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No leads yet" description="Leads worth prioritizing will show up here." dark />
      ) : (
        <ul className="divide-y divide-white/5">
          {scored.map(({ lead, score }) => {
            const urgency = urgencyLabel(lead);
            return (
              <li key={lead.id}>
                <Link href={`/leads/${lead.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                  <Avatar name={lead.full_name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{lead.full_name}</p>
                    <p className="text-xs text-charcoal-500 truncate">{lead.service_address || lead.notes || "No details yet"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <Badge variant={urgency.tone}>{urgency.label}</Badge>
                    <span className="text-xs text-charcoal-500">{score}/100</span>
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
