"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/utils";
import { Send, ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { Message } from "@/types/database";
import { cn } from "@/lib/utils";

interface ConvWithLead {
  id: string;
  channel: string;
  status: string;
  subject: string | null;
  leads: { name: string; email: string | null; phone: string | null } | null;
}

const STATUS_MAP: Record<string, "default" | "success" | "info" | "warning"> = {
  open: "info", resolved: "success", pending: "warning", closed: "default",
};

export function ConversationView({
  conversation,
  messages: initialMessages,
  currentUserId,
}: {
  conversation: ConvWithLead;
  messages: Message[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!text.trim()) return;
    setSending(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_type: "user",
        sender_id: currentUserId,
        content: text.trim(),
        is_read: true,
      })
      .select()
      .single();
    if (error) { toast.error(error.message); setSending(false); return; }
    setMessages((prev) => [...prev, data]);
    setText("");
    setSending(false);
  }

  const contactName = conversation.leads?.name ?? conversation.subject ?? "Unknown";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-charcoal-100 bg-white flex-shrink-0">
        <Link href="/conversations">
          <button className="p-1.5 rounded-lg hover:bg-charcoal-100 text-charcoal-500 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <Avatar name={contactName} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-charcoal-900 text-sm">{contactName}</p>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_MAP[conversation.status] ?? "default"} size="sm">{conversation.status}</Badge>
            <span className="text-xs text-charcoal-400 capitalize">{conversation.channel}</span>
          </div>
        </div>
        <button className="p-2 rounded-lg hover:bg-charcoal-100 text-charcoal-400">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin bg-charcoal-50/30">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-charcoal-400 text-sm">No messages yet. Start the conversation.</p>
          </div>
        )}
        {messages.map((msg) => {
          const isUser = msg.sender_type === "user";
          return (
            <div key={msg.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
              <Avatar name={isUser ? "Me" : contactName} size="xs" className={isUser ? "bg-gold-500" : ""} />
              <div className={cn("max-w-[70%]", isUser && "items-end flex flex-col")}>
                <div className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  isUser
                    ? "bg-charcoal-900 text-white rounded-tr-sm"
                    : "bg-white border border-charcoal-100 text-charcoal-800 rounded-tl-sm shadow-card"
                )}>
                  {msg.content}
                </div>
                <p className="text-xs text-charcoal-400 mt-1 px-1">{formatRelativeTime(msg.created_at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-charcoal-100 p-4 bg-white flex-shrink-0">
        <div className="flex items-end gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            className="flex-1 resize-none rounded-xl border border-charcoal-200 px-4 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-colors"
            style={{ minHeight: "42px", maxHeight: "120px" }}
          />
          <Button variant="gold" size="md" onClick={sendMessage} loading={sending} className="flex-shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
