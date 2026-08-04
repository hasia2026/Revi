"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  GraduationCap,
  BookOpen,
  Globe,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building2,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/conversations", label: "Conversations", icon: MessageSquare },
  { href: "/training", label: "Training", icon: GraduationCap },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/website", label: "Website", icon: Globe },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  userEmail?: string | null;
  userName?: string | null;
  businessName?: string | null;
}

export function Sidebar({ userEmail, userName, businessName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-charcoal-900 text-white transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-charcoal-700",
        collapsed && "justify-center px-0"
      )}>
        <div className="h-8 w-8 rounded-lg gold-gradient flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white leading-none">Revi</p>
            <p className="text-xs text-charcoal-400 mt-0.5 truncate">HASIA Technologies</p>
          </div>
        )}
      </div>

      {/* Business indicator */}
      {!collapsed && businessName && (
        <div className="mx-3 my-3 px-3 py-2 rounded-lg bg-charcoal-800 border border-charcoal-700">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-gold-400 flex-shrink-0" />
            <span className="text-xs font-medium text-charcoal-200 truncate">{businessName}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                active
                  ? "bg-gold-500/20 text-gold-300 border border-gold-500/20"
                  : "text-charcoal-300 hover:bg-charcoal-800 hover:text-white",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", active ? "text-gold-400" : "text-charcoal-400 group-hover:text-white")} style={{ height: "18px", width: "18px" }} />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gold-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={cn("border-t border-charcoal-700 p-3", collapsed && "flex justify-center")}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar name={userName || userEmail} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{userName || "Account"}</p>
              <p className="text-xs text-charcoal-400 truncate">{userEmail}</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-1.5 rounded-md text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="p-1.5 rounded-md text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-16 h-6 w-6 rounded-full bg-charcoal-700 border border-charcoal-600 text-charcoal-300 hover:text-white flex items-center justify-center shadow-md transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
