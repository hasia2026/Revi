import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  sub?: string;
  icon: LucideIcon;
  color?: "gold" | "blue" | "green" | "purple";
}

const colors = {
  gold: { bg: "bg-gold-50", icon: "text-gold-500", border: "border-gold-100" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
  green: { bg: "bg-emerald-50", icon: "text-emerald-500", border: "border-emerald-100" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
};

export function StatCard({ label, value, sub, icon: Icon, color = "gold" }: StatCardProps) {
  const c = colors[color];
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-charcoal-500">{label}</p>
        <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center border", c.bg, c.border)}>
          <Icon className={cn("h-4.5 w-4.5", c.icon)} style={{ height: "18px", width: "18px" }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-charcoal-900">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-charcoal-400 mt-1">{sub}</p>}
    </div>
  );
}
