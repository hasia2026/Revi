"use client";

import { useEffect, useState, useRef } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/cu3/dashboard-types";

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open || loaded) return;

    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: member } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!member?.business_id) return;

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("business_id", member.business_id)
        .order("created_at", { ascending: false })
        .limit(20);

      setNotifications(data ?? []);
      setLoaded(true);
    }

    load();
  }, [open, loaded]);

  async function markRead(notification: Notification) {
    if (notification.read) return;
    setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)));
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("id", notification.id);
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg text-charcoal-400 hover:bg-white/10 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gold-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-panel rounded-xl shadow-cue-glow z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="Nothing yet"
                description="Alerts, assignments, and deadlines will show up here as CUE's modules go live."
                className="py-10"
                dark
              />
            ) : (
              <ul className="divide-y divide-white/5">
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => markRead(n)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-white/[0.03] transition-colors flex gap-2",
                        !n.read && "bg-cue-blue-500/[0.06]"
                      )}
                    >
                      {!n.read && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cue-orange-400 flex-shrink-0" />}
                      <div className={cn("flex-1 min-w-0", n.read && "pl-3.5")}>
                        <p className="text-sm font-medium text-white">{n.title}</p>
                        {n.body && <p className="text-xs text-charcoal-400 mt-0.5">{n.body}</p>}
                        <p className="text-xs text-charcoal-500 mt-1">{formatRelativeTime(n.created_at)}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
