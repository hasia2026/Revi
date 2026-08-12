import Link from "next/link";
import { GENERIC_QUICK_ACTIONS, type QuickActionConfig } from "@/lib/cu3/quick-actions-config";

export function QuickActions({ actions = GENERIC_QUICK_ACTIONS }: { actions?: QuickActionConfig[] }) {
  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-charcoal-100">
        <h3 className="font-semibold text-charcoal-900 text-sm">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-charcoal-100 px-3 py-4 text-center hover:border-gold-300 hover:bg-gold-50/50 transition-colors"
            >
              <action.icon className="h-5 w-5 text-charcoal-500" />
              <span className="text-xs font-medium text-charcoal-700">{action.label}</span>
            </Link>
          ) : (
            <div
              key={action.label}
              title={action.disabledReason}
              className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-charcoal-200 px-3 py-4 text-center opacity-50 cursor-not-allowed"
            >
              <action.icon className="h-5 w-5 text-charcoal-400" />
              <span className="text-xs font-medium text-charcoal-500">{action.label}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
