"use client";

import { Bell, Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";

interface TopBarProps {
  title: string;
  subtitle?: string;
  userName?: string | null;
  userEmail?: string | null;
  actions?: React.ReactNode;
}

export function TopBar({ title, subtitle, userName, userEmail, actions }: TopBarProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-charcoal-100 bg-white flex-shrink-0">
      <div>
        <h1 className="text-xl font-semibold text-charcoal-900">{title}</h1>
        {subtitle && <p className="text-sm text-charcoal-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="p-2 rounded-lg text-charcoal-400 hover:bg-charcoal-50 hover:text-charcoal-700 transition-colors">
          <Bell className="h-5 w-5" />
        </button>
        <Avatar name={userName || userEmail} size="sm" />
      </div>
    </header>
  );
}
