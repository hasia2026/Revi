import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, Compass } from "lucide-react";
import type { RelatedModuleLink } from "@/lib/cu3/module-framework";

const RELATION_META = {
  upstream: { icon: ArrowUpRight, label: "Feeds from" },
  downstream: { icon: ArrowDownRight, label: "Feeds into" },
  compass: { icon: Compass, label: "Strategic center" },
};

export function ModuleRelatedModules({ modules }: { modules: RelatedModuleLink[] }) {
  if (modules.length === 0) return null;

  return (
    <section className="bg-white border border-charcoal-100 rounded-xl">
      <div className="px-5 py-4 border-b border-charcoal-100">
        <h2 className="text-sm font-semibold text-charcoal-800">Related Modules</h2>
        <p className="text-xs text-charcoal-400 mt-0.5">How this module connects to the rest of CUE</p>
      </div>
      <ul className="divide-y divide-charcoal-50">
        {modules.map((mod) => {
          const meta = RELATION_META[mod.relation];
          const Icon = meta.icon;
          return (
            <li key={mod.href}>
              <Link href={mod.href} className="flex items-center justify-between px-5 py-3 hover:bg-charcoal-50/50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-4 w-4 ${mod.relation === "compass" ? "text-gold-500" : "text-charcoal-400"}`} />
                  <span className="text-sm font-medium text-charcoal-800">{mod.label}</span>
                </div>
                <span className="text-xs text-charcoal-400">{meta.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
