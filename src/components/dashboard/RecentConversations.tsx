import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageSquare, ArrowRight } from "lucide-react";

interface ConvRow {
  id: string;
  status: string;
  subject: string | null;
  updated_at: string;
  leads: { full_name: string } | null;
}

export function RecentConversations({ conversations }: { conversations: ConvRow[] }) {
  return (
    <div className="glass-panel rounded-xl">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
        <h3 className="font-semibold text-white text-sm">Recent Conversations</h3>
        <Link href="/conversations" className="text-xs text-cue-blue-400 hover:text-cue-blue-300 font-medium flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No conversations yet" description="Conversations will appear here." dark />
      ) : (
        <ul className="divide-y divide-white/5">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link href={`/conversations/${conv.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors">
                <div className="h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-base flex-shrink-0">
                  💬
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {conv.leads?.full_name ?? conv.subject ?? "Unnamed"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={conv.status === "open" ? "info" : conv.status === "resolved" ? "success" : "default"}>
                    {conv.status}
                  </Badge>
                  <span className="text-xs text-charcoal-500">{formatRelativeTime(conv.updated_at)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
