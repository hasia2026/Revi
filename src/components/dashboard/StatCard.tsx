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
  gold: { icon: "text-cue-orange-400", glow: "shadow-cue-glow-sm" },
  blue: { icon: "text-cue-blue-400", glow: "shadow-cue-glow-sm" },
  green: { icon: "text-emerald-400", glow: "" },
  purple: { icon: "text-cue-purple-400", glow: "" },
};

export function StatCard({ label, value, sub, icon: Icon, color = "gold" }: StatCardProps) {
  const c = colors[color];
  return (
    <div className="glass-panel-hover rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-charcoal-400">{label}</p>
        <div className={cn("h-9 w-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center", c.glow)}>
          <Icon className={cn("h-4.5 w-4.5", c.icon)} style={{ height: "18px", width: "18px" }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-charcoal-500 mt-1">{sub}</p>}
    </div>
  );
}
