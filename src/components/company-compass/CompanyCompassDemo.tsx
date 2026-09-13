"use client";

import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  MessageSquareText,
  PhoneMissed,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const signals = [
  {
    label: "Revenue trend",
    value: "+8%",
    detail: "Higher-value jobs",
    icon: TrendingUp,
    tone: "text-emerald-300",
  },
  {
    label: "Booked jobs",
    value: "-11%",
    detail: "Compared with last month",
    icon: TrendingDown,
    tone: "text-amber-300",
  },
  {
    label: "Open estimates",
    value: "$7,800",
    detail: "4 waiting for follow-up",
    icon: CircleDollarSign,
    tone: "text-blue-600",
  },
  {
    label: "Follow-up health",
    value: "68%",
    detail: "6 opportunities need attention",
    icon: Activity,
    tone: "text-purple-600",
  },
];

const actions = [
  {
    id: "missed-call",
    urgency: "Act now",
    title: "Return a high-intent missed call",
    explanation:
      "A new prospect called 4 minutes ago. Calls returned within 5 minutes are more likely to become conversations.",
    impact: "Estimated opportunity: $450",
    source: "Twilio sample event",
    icon: PhoneMissed,
    accent: "border-red-400/40 bg-red-500/10",
  },
  {
    id: "estimates",
    urgency: "Revenue opportunity",
    title: "Follow up on 4 open estimates",
    explanation:
      "Booked jobs are down while $7,800 in quoted work is still undecided. Start with the two highest-value estimates.",
    impact: "Potential pipeline: $7,800",
    source: "Housecall Pro planned connection",
    icon: CircleDollarSign,
    accent: "border-amber-400/40 bg-amber-500/10",
  },
  {
    id: "reviews",
    urgency: "Growth opportunity",
    title: "Ask 12 satisfied customers for reviews",
    explanation:
      "These customers completed jobs without an open issue, but no review request has been recorded.",
    impact: "Strengthen local trust",
    source: "Reviews + job history",
    icon: Users,
    accent: "border-cue-blue-400/40 bg-cue-blue-500/10",
  },
];

export function CompanyCompassDemo() {
  const [completed, setCompleted] = useState(false);

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-cue-purple-400/30 bg-[#07101f] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(139,92,246,0.16),transparent_38%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cue-purple-300">
              <Sparkles className="h-4 w-4" /> CUE intelligence
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Revenue is growing, but future work needs attention.
            </h2>
            <p className="mt-2 text-sm leading-6 text-charcoal-300">
              Higher-ticket jobs lifted revenue 8%, while booked jobs fell 11%.
              CUE found $7,800 in open estimates and a new missed call that could
              help close the gap.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-5 py-4 lg:min-w-48">
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-300">
              Business health
            </p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-4xl font-semibold text-white">76</span>
              <span className="pb-1 text-sm text-charcoal-300">/ 100</span>
            </div>
            <p className="mt-1 text-xs text-emerald-200">Stable · 3 actions recommended</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Live business signals
            </p>
            <h3 className="mt-1 text-lg font-semibold text-charcoal-900">What CUE sees</h3>
          </div>
          <span className="text-xs text-charcoal-400">Demonstration data</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.label} className="rounded-xl border border-charcoal-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-charcoal-600">{signal.label}</p>
                  <Icon className={`h-4 w-4 ${signal.tone}`} />
                </div>
                <p className={`mt-3 text-2xl font-semibold ${signal.tone}`}>{signal.value}</p>
                <p className="mt-1 text-xs text-charcoal-500">{signal.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.45fr_0.75fr]">
        <div className="overflow-hidden rounded-xl border border-charcoal-200 bg-white shadow-sm">
          <div className="border-b border-charcoal-200 px-5 py-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cue-orange-300" />
              <h3 className="text-sm font-semibold text-charcoal-900">Recommended next actions</h3>
            </div>
            <p className="mt-1 text-xs text-charcoal-400">
              Prioritized by urgency, value, and customer impact.
            </p>
          </div>

          <div className="divide-y divide-charcoal-200">
            {actions.map((action) => {
              const Icon = action.icon;
              const isMissedCall = action.id === "missed-call";
              return (
                <article key={action.id} className="p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${action.accent}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-charcoal-200 bg-charcoal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-600">
                          {action.urgency}
                        </span>
                        <span className="text-[11px] text-charcoal-500">{action.source}</span>
                      </div>
                      <h4 className="mt-2 text-sm font-semibold text-charcoal-900">{action.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-charcoal-600">{action.explanation}</p>
                      <p className="mt-2 text-xs font-medium text-blue-600">{action.impact}</p>
                    </div>
                    {isMissedCall ? (
                      <Button
                        variant={completed ? "secondary" : "cue"}
                        size="sm"
                        disabled={completed}
                        onClick={() => setCompleted(true)}
                        className="shrink-0"
                      >
                        {completed ? <CheckCircle2 className="h-4 w-4" /> : <PhoneMissed className="h-4 w-4" />}
                        {completed ? "Callback logged" : "Log callback"}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="shrink-0 text-charcoal-700">
                        Review <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-charcoal-900">Connected evidence</h3>
            <p className="mt-1 text-xs leading-5 text-charcoal-400">
              CUE combines signals instead of making the owner open every system.
            </p>
            <div className="mt-4 space-y-2">
              {[
                ["Twilio", "Sample event", "Ready to connect"],
                ["Housecall Pro", "Planned", "Jobs · estimates · invoices"],
                ["QuickBooks", "Planned", "Revenue · cash flow"],
                ["Reviews", "Planned", "Reputation signals"],
              ].map(([name, status, detail]) => (
                <div key={name} className="rounded-lg border border-charcoal-200 bg-charcoal-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-charcoal-900">{name}</p>
                    <span className="text-[10px] font-medium text-purple-600">{status}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-charcoal-400">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-cue-blue-300" />
              <h3 className="text-sm font-semibold text-charcoal-900">Outcome loop</h3>
            </div>
            {completed ? (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-semibold">Action completed</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-charcoal-600">
                  Callback logged. CUE will watch for a conversation, estimate,
                  and booked-job outcome.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-xs text-charcoal-600">
                  <PhoneMissed className="h-4 w-4 text-red-300" /> Missed call captured
                </div>
                <div className="flex items-center gap-3 text-xs text-charcoal-600">
                  <Sparkles className="h-4 w-4 text-cue-purple-300" /> Opportunity explained
                </div>
                <div className="flex items-center gap-3 text-xs text-charcoal-600">
                  <Clock3 className="h-4 w-4 text-amber-300" /> Waiting for owner action
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
