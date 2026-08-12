"use client";

import { X, Sparkles, Send } from "lucide-react";
import { useState } from "react";
import type { AIAssistantPersona } from "@/lib/cu3/module-framework";

export function ModuleAIAssistant({
  persona,
  open,
  onClose,
}: {
  persona: AIAssistantPersona;
  open: boolean;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-charcoal-950/40" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal-100">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-charcoal-900 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-gold-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal-900">{persona.name}</p>
              <p className="text-xs text-charcoal-500">{persona.tagline}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-charcoal-400 hover:bg-charcoal-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 text-center">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-charcoal-50 border border-charcoal-100 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-charcoal-300" />
            </div>
            <p className="text-sm font-medium text-charcoal-700">Not connected yet</p>
            <p className="text-xs text-charcoal-400 mt-1 max-w-[220px] mx-auto">
              {persona.name} will be able to answer questions and take actions in this module once wired up.
            </p>
          </div>
        </div>

        <div className="border-t border-charcoal-100 p-3 flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Ask ${persona.name}...`}
            disabled
            className="flex-1 h-10 rounded-lg border border-charcoal-200 bg-charcoal-50 px-3 text-sm text-charcoal-400 placeholder:text-charcoal-400"
          />
          <button disabled className="h-10 w-10 rounded-lg bg-charcoal-100 text-charcoal-300 flex items-center justify-center flex-shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
