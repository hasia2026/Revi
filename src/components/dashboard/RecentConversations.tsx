import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageSquare, ArrowRight } from "lucide-react";

interface ConvRow {
  id: string;
  channel: string;
  status: string;
  subject: string | null;
  last_message_at: string | null;
  leads: { name: string } | null;
}

const CHANNEL_ICONS: Record<string, string> = {
  email: "✉️",
  sms: "💬",
  chat: "💭",
  phone: "📞",
};

export function RecentConversations({ conversations }: { conversations: ConvRow[] }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
        <h3 className="font-semibold text-charcoal-900 text-sm">Recent Conversations</h3>
        <Link href="/conversations" className="text-xs text-gold-600 hover:text-gold-700 font-medium flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {conversations.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No conversations yet" description="Conversations will appear here." />
      ) : (
        <ul className="divide-y divide-charcoal-50">
          {conversations.map((conv) => (
            <li key={conv.id}>
              <Link href={`/conversations/${conv.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-charcoal-50/50 transition-colors">
                <div className="h-9 w-9 rounded-lg bg-charcoal-100 flex items-center justify-center text-base flex-shrink-0">
                  {CHANNEL_ICONS[conv.channel] ?? "💬"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-charcoal-800 truncate">
                    {conv.leads?.name ?? conv.subject ?? "Unnamed"}
                  </p>
                  <p className="text-xs text-charcoal-400 capitalize">{conv.channel}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={conv.status === "open" ? "info" : conv.status === "resolved" ? "success" : "default"}>
                    {conv.status}
                  </Badge>
                  {conv.last_message_at && (
                    <span className="text-xs text-charcoal-400">{formatRelativeTime(conv.last_message_at)}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
