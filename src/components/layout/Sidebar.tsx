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
  ChevronDown,
  Building2,
  BedDouble,
  CalendarDays,
  LogOut,
  Inbox,
  Palette,
  Compass,
  Megaphone,
  LibraryBig,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HOSPITALITY_INDUSTRY } from "@/lib/industries";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";

type NavLink = { href: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; icon: LucideIcon; children: NavLink[] };
type NavEntry = NavLink | NavGroup;

function isGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

// CUE navigation. Customers and Brand Studio are groups because they each
// bundle multiple existing (or planned) pages under one umbrella concept —
// same interaction pattern for both rather than inventing a one-off UI for
// either.
const navEntries: NavEntry[] = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  {
    label: "Customers",
    icon: Users,
    children: [
      { href: "/leads", label: "Leads", icon: Users },
      { href: "/conversations", label: "Conversations", icon: MessageSquare },
    ],
  },
  { href: "/capture", label: "Capture", icon: Inbox },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/training", label: "Training", icon: GraduationCap },
  {
    label: "Brand Studio",
    icon: Palette,
    children: [
      { href: "/brand-studio/compass", label: "Company Compass", icon: Compass },
      { href: "/brand-studio/website", label: "Website Builder", icon: Globe },
      { href: "/brand-studio/marketing", label: "Marketing", icon: Megaphone },
      { href: "/brand-studio/library", label: "Executive Library", icon: LibraryBig },
      { href: "/brand-studio/mascot", label: "Mascot Studio", icon: Sparkles },
    ],
  },
  { href: "/growth", label: "Growth", icon: TrendingUp },
  { href: "/team", label: "Team", icon: Users },
  { href: "/automations", label: "Automations", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

const HOSPITALITY_GROUP: NavGroup = {
  label: "Hospitality",
  icon: BedDouble,
  children: [
    { href: "/rooms", label: "Rooms", icon: BedDouble },
    { href: "/reservations", label: "Reservations", icon: CalendarDays },
  ],
};

interface SidebarProps {
  userEmail?: string | null;
  userName?: string | null;
  businessName?: string | null;
  industry?: string | null;
}

export function Sidebar({ userEmail, userName, businessName, industry }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Single decision point. Do not scatter industry checks across nav items.
  const showHospitality = industry === HOSPITALITY_INDUSTRY;

  // Inserted before Settings so Settings stays last.
  const entries: NavEntry[] = showHospitality
    ? [
        ...navEntries.slice(0, -1),
        HOSPITALITY_GROUP,
        navEntries[navEntries.length - 1],
      ]
    : navEntries;

  function groupIsActive(group: NavGroup) {
    return group.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  }

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    entries.filter(isGroup).forEach((g) => {
      initial[g.label] = groupIsActive(g);
    });
    return initial;
  });

  function toggleGroup(label: string) {
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col cue-bg text-white transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-5 border-b border-white/10",
        collapsed && "justify-center px-0"
      )}>
        <div className="h-8 w-8 rounded-lg cue-gradient shadow-cue-glow-sm flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-sm text-white leading-none">CUE</p>
            <p className="text-xs text-charcoal-400 mt-0.5 truncate">HASI Technologies</p>
          </div>
        )}
      </div>

      {/* Business indicator */}
      {!collapsed && businessName && (
        <div className="mx-3 my-3 px-3 py-2 rounded-lg glass-panel">
          <div className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-cue-blue-400 flex-shrink-0" />
            <span className="text-xs font-medium text-charcoal-200 truncate">{businessName}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {entries.map((entry) => {
          if (isGroup(entry)) {
            const active = groupIsActive(entry);
            const open = collapsed ? active : (openGroups[entry.label] ?? active);
            const GroupIcon = entry.icon;

            return (
              <div key={entry.label}>
                <button
                  type="button"
                  onClick={() => toggleGroup(entry.label)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                    active
                      ? "cue-text font-semibold"
                      : "text-charcoal-300 hover:bg-charcoal-800 hover:text-white",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? entry.label : undefined}
                >
                  <GroupIcon
                    className={cn("h-4.5 w-4.5 flex-shrink-0", active ? "text-cue-orange-400" : "text-charcoal-400 group-hover:text-white")}
                    style={{ height: "18px", width: "18px" }}
                  />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left">{entry.label}</span>
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
                    </>
                  )}
                </button>

                {!collapsed && open && (
                  <div className="mt-0.5 ml-4 pl-3 border-l border-white/10 space-y-0.5">
                    {entry.children.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                            childActive
                              ? "bg-white/5 text-cue-blue-300"
                              : "text-charcoal-400 hover:bg-charcoal-800 hover:text-white"
                          )}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === entry.href || pathname.startsWith(entry.href + "/");
          const Icon = entry.icon;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                active
                  ? "glass-panel text-white shadow-cue-glow-sm"
                  : "text-charcoal-300 hover:bg-charcoal-800 hover:text-white",
                collapsed && "justify-center px-0"
              )}
              title={collapsed ? entry.label : undefined}
            >
              <Icon className={cn("h-4.5 w-4.5 flex-shrink-0", active ? "text-cue-orange-400" : "text-charcoal-400 group-hover:text-white")} style={{ height: "18px", width: "18px" }} />
              {!collapsed && <span>{entry.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full cue-gradient" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={cn("border-t border-white/10 p-3", collapsed && "flex justify-center")}>
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
