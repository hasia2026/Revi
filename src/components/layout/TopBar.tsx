"use client";

import { Avatar } from "@/components/ui/Avatar";
import { NotificationsBell } from "@/components/layout/NotificationsBell";

interface TopBarProps {
  title: string;
  subtitle?: string;
  userName?: string | null;
  userEmail?: string | null;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, userName, userEmail, actions }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/10 bg-charcoal-950 flex-shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <NotificationsBell />
        <Avatar name={userName || userEmail} size="sm" />
      </div>
    </header>
  );
}
