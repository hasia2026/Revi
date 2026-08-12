import type { QuickAction } from "@/lib/cu3/module-framework";
import Link from "next/link";

export function ModuleQuickActions({ actions }: { actions: QuickAction[] }) {
  if (actions.length === 0) return null;

  return (
    <section className="flex flex-wrap gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        const content = (
          <>
            <Icon className="h-4 w-4" />
            {action.label}
          </>
        );
        const className =
          "flex items-center gap-2 rounded-lg bg-charcoal-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-charcoal-800 transition-colors";

        return action.href ? (
          <Link key={action.label} href={action.href} className={className}>
            {content}
          </Link>
        ) : (
          <button key={action.label} type="button" onClick={action.onClick} className={className}>
            {content}
          </button>
        );
      })}
    </section>
  );
}
