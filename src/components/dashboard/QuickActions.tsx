import Link from "next/link";
import { GENERIC_QUICK_ACTIONS, type QuickActionConfig } from "@/lib/cu3/quick-actions-config";

export function QuickActions({ actions = GENERIC_QUICK_ACTIONS }: { actions?: QuickActionConfig[] }) {
  return (
    <div className="glass-panel rounded-xl">
      <div className="px-5 py-4 border-b border-white/10">
        <h3 className="font-semibold text-white text-sm">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-4 text-center hover:border-cue-blue-400/40 hover:bg-white/5 transition-colors"
            >
              <action.icon className="h-5 w-5 text-cue-blue-400" />
              <span className="text-xs font-medium text-charcoal-200">{action.label}</span>
            </Link>
          ) : (
            <div
              key={action.label}
              title={action.disabledReason}
              className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-4 text-center opacity-50 cursor-not-allowed"
            >
              <action.icon className="h-5 w-5 text-charcoal-500" />
              <span className="text-xs font-medium text-charcoal-500">{action.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
