import { History } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityItem } from "@/lib/cu3/module-framework";
import { formatRelativeTime } from "@/lib/utils";

export function ModuleActivity({ items }: { items: ActivityItem[] }) {
  return (
    <section className="bg-white border border-charcoal-100 rounded-xl">
      <div className="px-5 py-4 border-b border-charcoal-100">
        <h2 className="text-sm font-semibold text-charcoal-800">Activity</h2>
      </div>
      {items.length === 0 ? (
        <EmptyState icon={History} title="No activity yet" description="Recent changes and history will show up here." />
      ) : (
        <ul className="divide-y divide-charcoal-50">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-5 py-3">
              <p className="text-sm text-charcoal-700">
                {item.actor && <span className="font-medium text-charcoal-900">{item.actor} </span>}
                {item.description}
              </p>
              <span className="text-xs text-charcoal-400 flex-shrink-0 ml-3">{formatRelativeTime(item.timestamp)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
