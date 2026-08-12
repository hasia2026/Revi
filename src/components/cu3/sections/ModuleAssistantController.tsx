"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ModuleAIAssistant } from "./ModuleAIAssistant";
import type { AIAssistantPersona } from "@/lib/cu3/module-framework";

/**
 * Isolates the ONLY real interactivity in the module framework (opening/
 * closing the assistant panel) into its own client boundary. This exists
 * specifically so ModuleFramework and ModuleHero can be Server Components
 * — they render icon components (functions) from ModuleConfig directly,
 * which Next.js cannot serialize across a server->client prop boundary.
 * `persona` here is a plain {name, tagline} object, which is serializable,
 * so this is the only place a client/server boundary needs to exist.
 */
export function ModuleAssistantController({ persona }: { persona: AIAssistantPersona }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gold-200 bg-gold-50 px-4 py-2.5 text-sm font-medium text-charcoal-800 hover:bg-gold-100 transition-colors flex-shrink-0"
      >
        <Sparkles className="h-4 w-4 text-gold-600" />
        <span>
          Ask <span className="font-semibold">{persona.name}</span>
        </span>
      </button>

      <ModuleAIAssistant persona={persona} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
