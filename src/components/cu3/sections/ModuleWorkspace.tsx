import type { ReactNode } from "react";

/**
 * The one section with no standardized shape — tables, boards, kanban,
 * maps, charts, whatever the module actually does. Everything else in
 * the framework is structural scaffolding; this is where a module's
 * real functionality lives once built.
 */
export function ModuleWorkspace({ children }: { children: ReactNode }) {
  return (
    <section className="bg-white border border-charcoal-100 rounded-xl overflow-hidden">
      {children}
    </section>
  );
}
