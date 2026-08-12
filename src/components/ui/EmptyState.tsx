import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, className, dark = false }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
      <div
        className={cn(
          "h-14 w-14 rounded-2xl flex items-center justify-center mb-4 border",
          dark ? "bg-white/5 border-white/10" : "bg-charcoal-50 border-charcoal-100"
        )}
      >
        <Icon className={cn("h-7 w-7", dark ? "text-charcoal-400" : "text-charcoal-400")} />
      </div>
      <h3 className={cn("text-base font-semibold mb-1", dark ? "text-white" : "text-charcoal-800")}>{title}</h3>
      {description && (
        <p className={cn("text-sm max-w-xs leading-relaxed", dark ? "text-charcoal-400" : "text-charcoal-500")}>{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
