"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";

export type CompassLink = {
  id: string;
  recommendation_version_id: string;
  compass_dimension: string;
  alignment_explanation: string;
};

export type IntelligenceAuditEvent = {
  id: string;
  recommendation_id: string;
  event_type: string;
  actor_kind: string;
  event_summary: unknown;
  occurred_at: string;
};

export type IntelligenceRecommendation = {
  id: string;
  status: string;
  current_version_number: number;
  required_authority_level: string;
  approval_required: boolean;
  source_module: string;
  created_at: string;
  updated_at: string;
};

export type RecommendationDecision = {
  id: string;
  recommendation_id: string;
  decision: string;
  decider_membership_role: string;
  decision_reason: string | null;
  created_at: string;
};

export type RecommendationEvidence = {
  id: string;
  recommendation_version_id: string;
  source_system: string;
  observed_at: string;
  retrieved_at: string;
  freshness_status: string;
  relevance_explanation: string;
  evidence_summary: string;
  sensitivity: string;
};

export type RecommendationVersion = {
  id: string;
  recommendation_id: string;
  version_number: number;
  observation: string;
  interpretation: string;
  recommended_action: string;
  reasoning_summary: string;
  expected_outcome: string;
  confidence_level: string;
  confidence_explanation: string;
  risk_level: string;
  risk_explanation: string;
  assumptions: string[];
  uncertainties: string[];
  missing_information: string[];
};

import {
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileWarning,
  Package,
  Sparkles,
  Activity,
  TrendingUp,
  MessageSquareText,
  BellRing,
  CalendarClock,
  X,
  BarChart3,
  ListChecks,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const scenarios = [
  {
    id: "tech-sales",
    label: "Technician Sales",
    title: "See what each technician sold — without merging reports",
    value: "$42,680",
    description:
      "CUE connects technician, job, line item, revenue, and conversion data into one weekly view so the owner can drill from a technician to the exact jobs sold.",
    columns: ["Tech", "Jobs", "Sold", "Revenue", "Conv."],
    rows: [
      ["Mike", "14", "8", "$18,450", "57%"],
      ["Carlos", "11", "6", "$13,280", "55%"],
      ["Jordan", "13", "7", "$10,950", "54%"],
    ],
    action: "Open technician detail",
  },
  {
    id: "workday",
    label: "Technician Workday",
    title: "Mike's Tuesday is a job-by-job timeline",
    value: "7.4 hrs",
    description:
      "Daily time totals become useful when CUE ties each time entry back to the job, customer, work performed, and revenue outcome.",
    columns: ["Time", "Job", "Work", "Hours", "Revenue"],
    rows: [
      ["8:00", " #1042", "Diagnostic", "1.6", "$450"],
      ["10:30", "#1048", "Replacement", "2.8", "$1,850"],
      ["1:15", "#1051", "Repair", "1.4", "$275"],
    ],
    action: "View full workday",
  },
  {
    id: "booking",
    label: "Booking Rules",
    title: "Online booking request doesn't fit the native rules",
    value: "2 conflicts",
    description:
      "CUE evaluates service, day, time, and service-area constraints so the business can route customers instead of losing or misbooking them.",
    columns: ["Service", "Day", "Area", "HCP", "CUE"],
    rows: [
      ["Estimate", "Tue–Thu", "All", "Available", "Available"],
      ["Drain service", "Mon–Wed", "ZIP 926xx", "Conflict", "Route"],
      ["Drain service", "Thu", "ZIP 928xx", "Conflict", "Route"],
    ],
    action: "Review booking route",
  },
  {
    id: "conversation",
    label: "Customer Conversation",
    title: "A customer asked to book — but no appointment was created",
    value: "18 min",
    description:
      "CUE detects booking intent in the conversation and checks whether the operational outcome actually happened.",
    columns: ["Customer", "Signal", "Age", "Appointment", "Next"],
    rows: [
      ["Garcia", "Wants to schedule", "18 min", "None", "Follow up"],
      ["Patel", "Asked for pricing", "31 min", "None", "Review"],
      ["Lee", "Ready to book", "47 min", "None", "Escalate"],
    ],
    action: "Open response queue",
  },
  {
    id: "service-plan",
    label: "Service Plan Context",
    title: "Service-plan history needs context before the next conversation",
    value: "$250",
    description:
      "CUE keeps service-plan activity, delivered value, upcoming renewal, and customer context together so staff can act from the same picture.",
    columns: ["Customer", "Plan", "Service", "Value", "Renewal"],
    rows: [
      ["Anderson", "Pro Club", "Maintenance", "$125", "43 days"],
      ["Anderson", "Pro Club", "Prior service", "$125", "43 days"],
      ["Anderson", "Pro Club", "Next action", "—", "43 days"],
    ],
    action: "Review plan context",
  },
  {
    id: "data-quality",
    label: "Data Quality",
    title: "Important fields are present in the system — but not connected",
    value: "3 gaps",
    description:
      "CUE identifies information that prevents clean reporting, such as time entries without a linked job or records that cannot be reconciled across workflows.",
    columns: ["Signal", "Source", "Impact", "Status"],
    rows: [
      ["Time entry", "Time tracking", "Tech productivity", "Needs link"],
      ["Line item", "Job record", "Sales reporting", "Needs match"],
      ["Booking", "Online booking", "Conversion", "Needs outcome"],
    ],
    action: "Review data gaps",
  },
];

const signals: [string, string, string, LucideIcon][] = [
  ["Technician revenue", "$42,680", "This week", CircleDollarSign],
  ["Technician conversion", "55%", "31 jobs · 17 sold", TrendingUp],
  ["Booking outcomes", "3", "Need appointment review", CalendarClock],
  ["Data gaps", "3", "Need reconciliation", FileWarning],
];

export type CompanyCompassDemoProps = {
  canApprove?: boolean;
  demoMode?: boolean;
  dataAccessError?: string | null;
  recommendations?: IntelligenceRecommendation[];
  versions?: RecommendationVersion[];
  evidence?: RecommendationEvidence[];
  compassLinks?: CompassLink[];
  decisions?: RecommendationDecision[];
  auditEvents?: IntelligenceAuditEvent[];
};

function CueAction({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-charcoal-200 bg-charcoal-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-charcoal-900">{title}</p>
        <p className="mt-1 text-[11px] leading-4 text-charcoal-500">{detail}</p>
      </div>
      <button
        type="button"
        className="shrink-0 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 px-3 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:brightness-110"
      >
        {action}
      </button>
    </div>
  );
}


function MissedOpportunityCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState("150000");
  const [jobsPerMonth, setJobsPerMonth] = useState("180");
  const [missedCalls, setMissedCalls] = useState("18");
  const [unfollowedEstimates, setUnfollowedEstimates] = useState("12");
  const [noShows, setNoShows] = useState("8");
  const [overdueInvoices, setOverdueInvoices] = useState("4500");
  const [scanned, setScanned] = useState(false);

  const revenue = Number(monthlyRevenue) || 0;
  const jobs = Number(jobsPerMonth) || 0;
  const calls = Number(missedCalls) || 0;
  const estimates = Number(unfollowedEstimates) || 0;
  const cancellations = Number(noShows) || 0;
  const invoices = Number(overdueInvoices) || 0;

  const averageJobValue = jobs > 0 ? revenue / jobs : 0;

  /*
   * These are deliberately conservative illustrative assumptions.
   * This is an opportunity estimate, not a promise of recovered revenue.
   */
  const missedCallOpportunity =
    Math.round((calls * averageJobValue * 0.5) / 100) * 100;

  const estimateOpportunity =
    Math.round((estimates * 500) / 100) * 100;

  const noShowOpportunity =
    Math.round((cancellations * averageJobValue * 0.5) / 100) * 100;

  const invoiceOpportunity = invoices;

  const totalOpportunity =
    missedCallOpportunity +
    estimateOpportunity +
    noShowOpportunity +
    invoiceOpportunity;

  const annualOpportunity = totalOpportunity * 12;

  const money = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });

  const opportunityCards = [
    {
      title: "Missed calls",
      value: missedCallOpportunity,
      detail: `${calls} missed calls / month`,
      icon: Activity,
    },
    {
      title: "Unfollowed estimates",
      value: estimateOpportunity,
      detail: `${estimates} estimates without follow-up`,
      icon: TrendingUp,
    },
    {
      title: "No-shows & cancellations",
      value: noShowOpportunity,
      detail: `${cancellations} jobs affected`,
      icon: FileWarning,
    },
    {
      title: "Overdue invoices",
      value: invoiceOpportunity,
      detail: `${money(invoices)} currently outstanding`,
      icon: CircleDollarSign,
    },
  ];

  const inputClass =
    "mt-1 w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2.5 text-sm text-charcoal-900 outline-none transition focus:border-cue-purple-400 focus:ring-2 focus:ring-cue-purple-100";

  return (
    <section
      id="cue-revenue-opportunity-scan"
      className="relative overflow-hidden rounded-2xl border border-cue-purple-300 bg-white p-5 shadow-lg ring-1 ring-cue-purple-100 md:p-6"
    >
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cue-purple-100/60 blur-3xl" />

      <div className="relative">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cue-purple-200 bg-cue-purple-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cue-purple-700">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Revenue Opportunity Scan
            </div>

            <h2 className="mt-3 text-xl font-bold tracking-tight text-charcoal-950 md:text-2xl">
              How much opportunity is hiding inside the operation?
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-charcoal-500">
              Start with a few operating numbers. CUE estimates identifiable
              revenue opportunity, then shows where to investigate it.
            </p>
          </div>

          <div className="rounded-xl border border-cue-purple-200 bg-cue-purple-50 px-4 py-3 md:min-w-[180px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cue-purple-600">
              Demo company
            </p>
            <p className="mt-1 text-sm font-bold text-charcoal-900">
              Apex Air &amp; Comfort
            </p>
            <p className="mt-1 text-[11px] text-charcoal-500">
              Illustrative HVAC data
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.15fr]">
          <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-cue-purple-600" />
              <h3 className="text-sm font-semibold text-charcoal-900">
                Operating inputs
              </h3>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-charcoal-700">
                Monthly revenue
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={monthlyRevenue}
                  onChange={(e) => {
                    setMonthlyRevenue(e.target.value);
                    setScanned(false);
                  }}
                />
              </label>

              <label className="text-xs font-semibold text-charcoal-700">
                Jobs per month
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={jobsPerMonth}
                  onChange={(e) => {
                    setJobsPerMonth(e.target.value);
                    setScanned(false);
                  }}
                />
              </label>

              <label className="text-xs font-semibold text-charcoal-700">
                Missed calls / month
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={missedCalls}
                  onChange={(e) => {
                    setMissedCalls(e.target.value);
                    setScanned(false);
                  }}
                />
              </label>

              <label className="text-xs font-semibold text-charcoal-700">
                Unfollowed estimates
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={unfollowedEstimates}
                  onChange={(e) => {
                    setUnfollowedEstimates(e.target.value);
                    setScanned(false);
                  }}
                />
              </label>

              <label className="text-xs font-semibold text-charcoal-700">
                No-shows / cancellations
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={noShows}
                  onChange={(e) => {
                    setNoShows(e.target.value);
                    setScanned(false);
                  }}
                />
              </label>

              <label className="text-xs font-semibold text-charcoal-700">
                Overdue invoices
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={overdueInvoices}
                  onChange={(e) => {
                    setOverdueInvoices(e.target.value);
                    setScanned(false);
                  }}
                />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setScanned(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Scan for opportunities
              </button>

              {scanned && (
                <button
                  type="button"
                  onClick={() => setScanned(false)}
                  className="rounded-lg border border-charcoal-200 bg-white px-4 py-2.5 text-xs font-semibold text-charcoal-600 hover:bg-charcoal-50"
                >
                  Reset scan
                </button>
              )}
            </div>

            <p className="mt-3 text-[10px] leading-4 text-charcoal-400">
              Demo calculations use conservative assumptions and are intended
              to illustrate CUE&apos;s workflow, not guarantee recovered revenue.
            </p>
          </div>

          <div
            className={`rounded-xl border p-5 transition ${
              scanned
                ? "border-cue-purple-300 bg-[#0b1220] text-white"
                : "border-charcoal-200 bg-white"
            }`}
          >
            {!scanned ? (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cue-purple-50">
                  <CircleDollarSign className="h-6 w-6 text-cue-purple-600" />
                </div>

                <h3 className="mt-4 text-base font-bold text-charcoal-900">
                  Run the opportunity scan
                </h3>

                <p className="mt-2 max-w-sm text-xs leading-5 text-charcoal-500">
                  CUE will turn the operating inputs into a dollar-based
                  opportunity picture and identify the areas worth investigating.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cue-purple-300">
                      Identifiable monthly revenue opportunity
                    </p>

                    <p className="mt-2 text-4xl font-bold tracking-tight">
                      {money(totalOpportunity)}
                    </p>

                    <p className="mt-2 text-xs text-charcoal-300">
                      Approximately {money(annualOpportunity)} annually if the
                      same opportunity pattern persists.
                    </p>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right">
                    <p className="text-[10px] uppercase tracking-wider text-charcoal-300">
                      Average job value
                    </p>
                    <p className="mt-1 text-sm font-bold">
                      {money(averageJobValue)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {opportunityCards.map((card) => {
                    const Icon = card.icon;

                    return (
                      <div
                        key={card.title}
                        className="rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-cue-purple-300" />
                            <p className="text-xs font-semibold">{card.title}</p>
                          </div>

                          <p className="text-sm font-bold">
                            {money(card.value)}
                          </p>
                        </div>

                        <p className="mt-2 text-[11px] text-charcoal-300">
                          {card.detail}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            document
                              .getElementById("cue-company-compass-intelligence")
                              ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                              })
                          }
                          className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-cue-purple-300 hover:text-white"
                        >
                          Investigate with CUE
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-cue-purple-300/20 bg-cue-purple-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-cue-purple-300" />

                    <div>
                      <p className="text-xs font-semibold">
                        Next: let CUE investigate the opportunity
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-charcoal-300">
                        The calculator identifies the signal. CUE&apos;s
                        intelligence layer connects the signal to the underlying
                        jobs, technicians, estimates, conversations, payments,
                        and outcomes so the owner can decide what to do next.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}



// ============================================================
// CUE QUICK QUESTIONS
// Revi's demo knowledge layer for common CUE questions.
// ============================================================

const CUE_QUICK_QUESTIONS = [
  {
    question: "What does CUE do?",
    answer:
      "CUE is an intelligence layer that sits above the systems a business already uses. It connects operational signals, finds patterns and missed opportunities, explains what may be causing them, and points the team toward the next action."
  },
  {
    question: "How can CUE help service businesses?",
    answer:
      "CUE helps service businesses find revenue and operational opportunities hiding inside everyday activity — including missed calls, slow follow-up, unsold estimates, no-shows, scheduling problems, technician utilization, and overdue invoices."
  },
  {
    question: "Is CUE a CRM?",
    answer:
      "No. CUE is not designed to replace the CRM. It sits above systems like Housecall Pro and other business tools, analyzes the signals coming from them, and turns those signals into actionable intelligence."
  },
  {
    question: "How does CUE work with Housecall Pro?",
    answer:
      "Housecall Pro can remain the system of record for jobs, scheduling, technicians, and customer activity. CUE analyzes those operational signals to identify patterns, quantify opportunities, and guide the investigation."
  },
  {
    question: "What does CUE actually look for?",
    answer:
      "CUE looks for operational signals that can indicate lost revenue, wasted time, bottlenecks, or customer-experience problems. It connects signals that are often viewed separately and helps explain the larger business pattern."
  },
  {
    question: "How does CUE find missed revenue?",
    answer:
      "CUE starts with measurable signals such as missed calls, unfollowed estimates, cancellations, no-shows, and overdue invoices. It can quantify the potential opportunity and then move into the underlying records to investigate what happened."
  },
  {
    question: "What happens after CUE finds an opportunity?",
    answer:
      "CUE moves from detection to investigation. It connects the relevant evidence, explains the likely operational issue, surfaces a recommended next step, and gives the business owner or manager the information needed to make the decision."
  },
  {
    question: "Who is CUE built for?",
    answer:
      "CUE is designed for businesses with operational complexity and multiple systems — especially service businesses such as HVAC, plumbing, electrical, roofing, cleaning, landscaping, and other field-service operations."
  },
  {
    question: "How is CUE different from a CRM?",
    answer:
      "A CRM primarily stores and manages customer and operational records. CUE is focused on intelligence across those records — detecting signals, connecting patterns, quantifying opportunities, and helping teams decide what deserves attention."
  },
  {
    question: "Can CUE connect multiple business systems?",
    answer:
      "Yes. The architecture is designed to connect signals from multiple systems rather than forcing the business to replace them. That can include CRM, accounting, communications, scheduling, booking, and other operational systems."
  },
]


// ============================================================
// CUE_REVI_ANSWER
// Demo knowledge layer for Revi.
// Keeps the demo deterministic until the AI gateway is connected.
// ============================================================

function CUE_REVI_ANSWER(question: string): string {
  const q = question.toLowerCase().trim();

  if (q.includes("what does cue do")) {
    return "CUE is an intelligence layer that sits above the systems your business already uses. It connects operational signals, finds patterns and missed opportunities, explains what may be causing them, and points your team toward the next action.";
  }

  if (
    q.includes("how can cue help") ||
    q.includes("help service businesses") ||
    q.includes("help my business")
  ) {
    return "CUE helps service businesses find revenue and operational opportunities hiding inside everyday activity — including missed calls, slow follow-up, unsold estimates, no-shows, scheduling problems, technician utilization, and overdue invoices.";
  }

  if (q.includes("is cue a crm")) {
    return "No. CUE is not designed to replace the CRM. It sits above systems like Housecall Pro and other business tools, analyzes the signals coming from them, and turns those signals into actionable intelligence.";
  }

  if (
    q.includes("housecall pro") ||
    q.includes("hcp")
  ) {
    return "Housecall Pro can remain the system of record for jobs, scheduling, technicians, and customer activity. CUE analyzes those operational signals to identify patterns, quantify opportunities, and guide the investigation.";
  }

  if (
    q.includes("what does cue look for") ||
    q.includes("what does cue actually look for")
  ) {
    return "CUE looks for operational signals that can indicate lost revenue, wasted time, bottlenecks, or customer-experience problems. It connects signals that are often viewed separately and helps explain the larger business pattern.";
  }

  if (
    q.includes("how does cue find") ||
    q.includes("missed revenue") ||
    q.includes("lost revenue")
  ) {
    return "CUE starts with measurable signals such as missed calls, unfollowed estimates, cancellations, no-shows, and overdue invoices. It can quantify the potential opportunity and then move into the underlying records to investigate what happened.";
  }

  if (
    q.includes("what happens after cue") ||
    q.includes("after cue finds") ||
    q.includes("next step")
  ) {
    return "CUE moves from detection to investigation. It connects the relevant evidence, explains the likely operational issue, surfaces a recommended next step, and gives the business owner or manager the information needed to make the decision.";
  }

  if (
    q.includes("who is cue built for") ||
    q.includes("who is cue for")
  ) {
    return "CUE is designed for businesses with operational complexity and multiple systems — especially service businesses such as HVAC, plumbing, electrical, roofing, cleaning, landscaping, and other field-service operations.";
  }

  if (q.includes("different from a crm") || q.includes("difference between cue and crm")) {
    return "A CRM primarily stores and manages customer and operational records. CUE focuses on intelligence across those records — detecting signals, connecting patterns, quantifying opportunities, and helping teams decide what deserves attention.";
  }

  if (
    q.includes("multiple systems") ||
    q.includes("connect multiple") ||
    q.includes("integrations")
  ) {
    return "Yes. CUE is designed to connect signals from multiple systems rather than forcing the business to replace them. That can include CRM, accounting, communications, scheduling, booking, and other operational systems.";
  }

  if (
    q.includes("what needs my attention") ||
    q.includes("attention")
  ) {
    return "Right now, CUE is flagging four active signals: an $1,850 estimate with no follow-up for 48 hours, two booking leads without appointments, a technician conversion signal, and three jobs with time entries that need reconciliation.";
  }

  if (
    q.includes("estimate") ||
    q.includes("follow up")
  ) {
    return "CUE found an $1,850 estimate with no follow-up for 48 hours. The next step is to investigate the estimate record, determine why follow-up stopped, and decide whether the customer should be contacted.";
  }

  return "I can help explain how CUE works. Try asking me what CUE does, how CUE helps service businesses, whether CUE is a CRM, how CUE works with Housecall Pro, or how CUE finds missed revenue.";
}

export function CompanyCompassDemo(_props: CompanyCompassDemoProps) {
  const [activeId, setActiveId] = useState("tech-sales");
  const [actioned, setActioned] = useState<string[]>([]);
  const [reportOpen, setReportOpen] = useState(false);
  const [reviOpen, setReviOpen] = useState(false);
  const [reviMessage, setReviMessage] = useState("");

  const active = scenarios.find((s) => s.id === activeId) ?? scenarios[0];
  const done = actioned.includes(active.id);

  const reportContent: Record<
    string,
    {
      title: string;
      summary: string;
      metrics: [string, string][];
      detail: string[];
    }
  > = {
    "tech-sales": {
      title: "Technician Sales Report",
      summary:
        "Weekly sales performance connected from technician, job, line-item, and revenue records.",
      metrics: [
        ["Revenue", "$42,680"],
        ["Jobs", "31"],
        ["Sold", "17"],
        ["Conversion", "55%"],
      ],
      detail: [
        "Mike · 8 sold · $18,450 · 57%",
        "Carlos · 6 sold · $13,280 · 55%",
        "Jordan · 7 sold · $10,950 · 54%",
        "Drill-down available to individual jobs and line items.",
      ],
    },
    workday: {
      title: "Technician Workday Report",
      summary:
        "A job-by-job view of Mike's Tuesday instead of one daily time total.",
      metrics: [
        ["Hours", "7.4"],
        ["Jobs", "3"],
        ["Revenue", "$2,575"],
        ["Unlinked", "0"],
      ],
      detail: [
        "8:00 · #1042 · Diagnostic · 1.6 hrs · $450",
        "10:30 · #1048 · Replacement · 2.8 hrs · $1,850",
        "1:15 · #1051 · Repair · 1.4 hrs · $275",
        "CUE reconciles the time entries back to the jobs.",
      ],
    },
    booking: {
      title: "Booking Rules Review",
      summary:
        "CUE compared the requested service, day, service area, and existing HCP booking rules.",
      metrics: [
        ["Conflicts", "2"],
        ["Routes", "2"],
        ["Accepted", "1"],
        ["Unresolved", "0"],
      ],
      detail: [
        "Drain service · Mon–Wed · ZIP 926xx → route for review",
        "Drain service · Thu · ZIP 928xx → route for review",
        "Estimate · Tue–Thu · all areas → available",
        "CUE shows the conflict and the suggested routing decision.",
      ],
    },
    conversation: {
      title: "Booking Conversation Report",
      summary:
        "CUE detected booking intent and checked whether an appointment outcome followed.",
      metrics: [
        ["Signals", "3"],
        ["No appointment", "3"],
        ["Oldest", "47 min"],
        ["Priority", "High"],
      ],
      detail: [
        "Garcia · wants to schedule · 18 min · follow up",
        "Patel · asked for pricing · 31 min · review",
        "Lee · ready to book · 47 min · escalate",
        "The report connects conversation activity to the appointment outcome.",
      ],
    },
    "service-plan": {
      title: "Service Plan Context Report",
      summary:
        "A customer-level view combining plan history, delivered service, value, and renewal timing.",
      metrics: [
        ["Customer", "Anderson"],
        ["Plan value", "$250"],
        ["Renewal", "43 days"],
        ["Next action", "Review"],
      ],
      detail: [
        "Pro Club · maintenance · $125",
        "Pro Club · prior service · $125",
        "Renewal · 43 days · no next action logged",
        "CUE gives staff the context before the next customer conversation.",
      ],
    },
    "data-quality": {
      title: "Data Reconciliation Report",
      summary:
        "CUE identifies records that exist but cannot yet support reliable cross-workflow reporting.",
      metrics: [
        ["Gaps", "3"],
        ["Time", "1"],
        ["Line item", "1"],
        ["Booking", "1"],
      ],
      detail: [
        "Time entry → missing job link → technician productivity affected",
        "Line item → needs record match → sales reporting affected",
        "Booking → needs outcome → conversion reporting affected",
        "CUE makes the data-quality work visible instead of hiding it inside reports.",
      ],
    },
  };

  const report = reportContent[active.id];

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-2xl border border-cue-purple-400/30 bg-[#07101f] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.3)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(59,130,246,0.18),transparent_34%),radial-gradient(circle_at_90%_90%,rgba(139,92,246,0.16),transparent_38%)]" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            <Sparkles className="h-4 w-4" /> CUE intelligence
          </div>
          <h2 className="mt-3 max-w-3xl text-2xl font-semibold text-white">
            HCP records the work. CUE watches what happens next.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-charcoal-300">
            CUE sits above the workflow and looks across jobs, estimates,
            purchases, memberships, documentation, and customer activity to
            surface the exceptions that are easy to miss during a busy day.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-charcoal-300">
            {["Capture", "Understand", "Enhance", "Execute", "Expand"].map(
              (item, i) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
                >
                  {i + 1}. {item}
                </span>
              ),
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-400">
              Daily intelligence check
            </p>
            <h3 className="mt-1 text-lg font-semibold text-charcoal-900">
              What CUE understands across the workflow
            </h3>
          </div>
          <MissedOpportunityCalculator />

        <span className="text-xs text-charcoal-400">Demonstration data</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {signals.map(([label, value, detail, Icon]) => {
            const I = Icon as typeof Activity;
            return (
              <div
                key={String(label)}
                className="rounded-xl border border-charcoal-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-charcoal-600">
                    {label}
                  </p>
                  <I className="h-4 w-4 text-cue-blue-300" />
                </div>
                <p className="mt-3 text-2xl font-semibold text-charcoal-900">
                  {value}
                </p>
                <p className="mt-1 text-xs text-charcoal-500">{detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-charcoal-200 bg-white shadow-sm">
        <div className="border-b border-charcoal-200 px-5 pt-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-cue-orange-300" />
            <h3 className="text-sm font-semibold text-charcoal-900">
              HCP workflow · Where CUE adds intelligence
            </h3>
          </div>
          <p className="mt-1 pb-4 text-xs text-charcoal-400">
            Six HCP workflow scenarios. Click one to see how CUE connects the
            data and surfaces the next action.
          </p>
          <div className="flex gap-1 overflow-x-auto">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                className={`whitespace-nowrap border-b-2 px-3 py-3 text-xs font-semibold transition ${activeId === s.id ? "border-cue-purple-500 text-cue-purple-700" : "border-transparent text-charcoal-500 hover:text-charcoal-800"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 xl:grid-cols-[1.5fr_0.75fr]">
          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-charcoal-200 bg-charcoal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-600">
                  Detected by CUE · no AI theatrics
                </span>
                <h4 className="mt-3 text-lg font-semibold text-charcoal-900">
                  {active.title}
                </h4>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-charcoal-600">
                  {active.description}
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-charcoal-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
                  Exception value
                </p>
                <p className="mt-1 text-xl font-semibold text-charcoal-900">
                  {active.value}
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-charcoal-200">
              <div
                className="grid bg-charcoal-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-charcoal-500"
                style={{
                  gridTemplateColumns: `repeat(${active.columns.length}, minmax(0, 1fr))`,
                }}
              >
                {active.columns.map((c) => (
                  <span key={c}>{c}</span>
                ))}
              </div>
              <div className="divide-y divide-charcoal-200">
                {active.rows.map((row, ri) => (
                  <div
                    key={ri}
                    className="grid px-3 py-3 text-xs text-charcoal-700"
                    style={{
                      gridTemplateColumns: `repeat(${active.columns.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {row.map((cell, ci) => (
                      <span
                        key={ci}
                        className={
                          ci === row.length - 1
                            ? "font-semibold text-charcoal-900"
                            : ""
                        }
                      >
                        {cell}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="cue"
                size="sm"
                onClick={() => setReportOpen(true)}
              >
                <BarChart3 className="h-4 w-4" />
                Show mock report
              </Button>
              <Button
                variant={done ? "secondary" : "primary"}
                size="sm"
                onClick={() => !done && setActioned([...actioned, active.id])}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <ListChecks className="h-4 w-4" />
                )}
                {done ? "Action logged" : active.action}
              </Button>
              <span className="text-[11px] text-charcoal-400">
                Click the report to see what a pilot user would actually
                receive.
              </span>
            </div>
          </div>

          <aside className="rounded-xl border border-cue-blue-200 bg-cue-blue-50/50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cue-blue-700">
              Why this matters
            </p>
            <div className="mt-4 space-y-4">
              {[
                ["Event", "A workflow event occurs."],
                ["Context", "CUE checks related records."],
                ["Exception", "It finds something worth reviewing."],
                ["Action", "The owner gets a specific next step."],
              ].map(([step, copy], i) => (
                <div key={step} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-cue-blue-700 shadow-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-charcoal-900">
                      {step}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-5 text-charcoal-600">
                      {copy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {reportOpen && (
        <section id="cue-company-compass-intelligence" className="rounded-xl border border-cue-purple-300 bg-white p-5 shadow-lg ring-2 ring-cue-purple-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cue-purple-600" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cue-purple-700">
                  Mock report · generated by CUE
                </p>
              </div>
              <h3 className="mt-2 text-xl font-semibold text-charcoal-900">
                {report.title}
              </h3>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-charcoal-600">
                {report.summary}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close mock report"
              onClick={() => setReportOpen(false)}
              className="rounded-lg p-2 text-charcoal-400 hover:bg-charcoal-100 hover:text-charcoal-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {report.metrics.map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
                  {label}
                </p>
                <p className="mt-2 text-xl font-semibold text-charcoal-900">
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-xl border border-charcoal-200">
              <div className="flex items-center justify-between border-b border-charcoal-200 px-4 py-3">
                <p className="text-xs font-semibold text-charcoal-900">
                  What CUE found
                </p>
                <span className="text-[10px] text-charcoal-400">Demo data</span>
              </div>
              <div className="divide-y divide-charcoal-200">
                {report.detail.map((line) => (
                  <div
                    key={line}
                    className="flex gap-3 px-4 py-3 text-xs text-charcoal-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cue-blue-500" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-cue-blue-200 bg-cue-blue-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-cue-blue-700">
                Owner decision
              </p>
              <p className="mt-2 text-sm font-semibold text-charcoal-900">
                {active.action}
              </p>
              <p className="mt-2 text-xs leading-5 text-charcoal-600">
                CUE surfaces the evidence, explains why it matters, and gives
                the user a clear next step. The user decides whether to act.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActioned(
                    actioned.includes(active.id)
                      ? actioned
                      : [...actioned, active.id],
                  );
                  setReportOpen(false);
                }}
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cue-blue-700 hover:underline"
              >
                Log this action <ExternalLink className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-cue-purple-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cue-purple-600" />
              <h3 className="text-base font-semibold text-charcoal-900">
                What needs your attention?
              </h3>
            </div>
            <p className="mt-1 text-xs leading-5 text-charcoal-500">
              CUE is the interface. Housecall Pro remains the system of record underneath it.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-cue-purple-200 bg-cue-purple-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cue-purple-700">
            4 active signals
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-3">
            <CueAction
              title="$1,850 estimate"
              detail="No follow-up for 48 hours"
              action="Follow up"
            />
            <CueAction
              title="2 booking leads"
              detail="No appointment created · 18–47 min"
              action="Respond"
            />
            <CueAction
              title="Mike · 57% conversion"
              detail="14 jobs · 8 sold this week"
              action="View technician"
            />
            <CueAction
              title="3 jobs · 7.4 hrs"
              detail="Time entries need reconciliation"
              action="Review data"
            />
          </div>

        </div>
      </section>

      <div className="fixed bottom-5 right-5 z-50">
        {reviOpen && (
          <div className="absolute bottom-14 right-0 flex h-[460px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-charcoal-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-charcoal-200 bg-charcoal-950 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cue-purple-300" />
                <div>
                  <p className="text-sm font-semibold">Revi</p>
                  <p className="text-[10px] text-charcoal-300">
                    Your CUE business guide
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviOpen(false)}
                className="rounded-md px-2 py-1 text-lg leading-none text-charcoal-300 hover:bg-white/10 hover:text-white"
                aria-label="Close Revi"
              >
                ×
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {!reviMessage && (
                <>
                  <div className="max-w-[92%] rounded-xl bg-charcoal-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-cue-purple-700">
                      Revi
                    </p>
                    <p className="mt-1 text-xs leading-5 text-charcoal-700">
                      What would you like to know about CUE?
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReviMessage("What does CUE do?")}
                    className="rounded-full border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    What does CUE do?
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReviMessage("How can CUE help service businesses?")
                    }
                    className="rounded-full border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    How can CUE help my business?
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviMessage("Is CUE a CRM?")}
                    className="rounded-full border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    Is CUE a CRM?
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setReviMessage("How does CUE work with Housecall Pro?")
                    }
                    className="rounded-full border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    How does CUE work with Housecall Pro?
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviMessage("How does CUE find missed revenue?")}
                    className="rounded-full border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    How does CUE find missed revenue?
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviMessage("What needs my attention?")}
                    className="rounded-full border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    What needs my attention?
                  </button>
                </div>
                </>
              )}

              {reviMessage && (
                <>
                  <div className="ml-auto max-w-[88%] rounded-xl bg-cue-purple-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-cue-purple-700">
                      You
                    </p>
                    <p className="mt-1 text-xs leading-5 text-charcoal-700">
                      {reviMessage}
                    </p>
                  </div>

                  <div className="max-w-[92%] rounded-xl bg-charcoal-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-cue-purple-700">
                      Revi
                    </p>
                    <p className="mt-1 text-xs leading-5 text-charcoal-700">
                      {CUE_REVI_ANSWER(reviMessage)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setReviMessage("")}
                    className="w-full rounded-xl border border-charcoal-200 px-3 py-2 text-[10px] font-semibold text-charcoal-700 hover:bg-charcoal-50"
                  >
                    Ask another question
                  </button>
                </>
              )}
            </div>

            <form
              className="flex shrink-0 gap-2 border-t border-charcoal-200 p-3"
              onSubmit={(event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const input = form.elements.namedItem("revi-input") as HTMLInputElement;
                const value = input.value.trim();

                if (!value) return;

                setReviMessage(value);
                input.value = "";
              }}
            >
              <input
                name="revi-input"
                type="text"
                placeholder="Ask Revi anything..."
                className="min-w-0 flex-1 rounded-xl border border-charcoal-200 px-3 py-2 text-xs text-charcoal-900 outline-none placeholder:text-charcoal-400 focus:border-cue-purple-400 focus:ring-2 focus:ring-cue-purple-100"
                aria-label="Ask Revi a question"
              />
              <button
                type="submit"
                className="rounded-xl bg-charcoal-950 px-3 py-2 text-xs font-semibold text-white hover:bg-charcoal-900"
              >
                Send
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setReviOpen((value) => !value)}
          aria-expanded={reviOpen}
          className="ml-auto flex h-12 items-center gap-2 rounded-full bg-charcoal-950 px-4 text-xs font-semibold text-white shadow-lg transition hover:bg-charcoal-900"
        >
          <Sparkles className="h-4 w-4 text-cue-purple-300" />
          Ask Revi

        </button>
      </div>

      <section className="rounded-xl border border-cue-purple-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-cue-purple-600" />
              <h3 className="text-sm font-semibold text-charcoal-900">
                CUE Command Center · What needs attention?
              </h3>
            </div>
            <p className="mt-1 text-xs leading-5 text-charcoal-500">
              Instead of making the owner hunt through reports, CUE turns
              connected HCP activity into a short exception queue.
            </p>
          </div>
          <span className="rounded-full border border-cue-purple-200 bg-cue-purple-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cue-purple-700">
            4 active signals
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-charcoal-900">
                  $1,850 estimate
                </p>
                <p className="mt-1 text-[11px] text-charcoal-500">
                  No follow-up
                </p>
              </div>
              <span className="text-[10px] font-semibold text-cue-purple-600">
                48 hrs
              </span>
            </div>
            <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">
              Follow up →
            </button>
          </div>
          <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-charcoal-900">
                  2 booking leads
                </p>
                <p className="mt-1 text-[11px] text-charcoal-500">
                  No appointment
                </p>
              </div>
              <span className="text-[10px] font-semibold text-cue-purple-600">
                18–47 min
              </span>
            </div>
            <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">
              Respond →
            </button>
          </div>
          <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-charcoal-900">
                  Mike · 57%
                </p>
                <p className="mt-1 text-[11px] text-charcoal-500">
                  Weekly conversion
                </p>
              </div>
              <span className="text-[10px] font-semibold text-cue-purple-600">
                14 jobs
              </span>
            </div>
            <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">
              View tech →
            </button>
          </div>
          <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-charcoal-900">
                  3 jobs
                </p>
                <p className="mt-1 text-[11px] text-charcoal-500">
                  Time not linked
                </p>
              </div>
              <span className="text-[10px] font-semibold text-cue-purple-600">
                7.4 hrs total
              </span>
            </div>
            <button className="mt-4 text-[11px] font-semibold text-cue-blue-700 hover:underline">
              Review →
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-charcoal-900">
              CUE outcome check
            </h3>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["17", "sold this week"],
              ["3", "booking reviews"],
              ["3", "data gaps"],
            ].map(([v, l]) => (
              <div
                key={l}
                className="rounded-lg border border-charcoal-200 bg-charcoal-50 p-3 text-center"
              >
                <p className="text-2xl font-semibold text-charcoal-900">{v}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-charcoal-500">
                  {l}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-charcoal-500">
            CUE turns disconnected operational records into a short list of
            actions and measurable outcomes.
          </p>
        </div>
        <div className="rounded-xl border border-charcoal-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-charcoal-900">
            Connected systems
          </h3>
          <p className="mt-1 text-xs leading-5 text-charcoal-400">
            CUE is designed to sit above the systems the business already uses
            and connect the signals they contain.
          </p>
          <div className="mt-4 space-y-2">
            {[
              ["Housecall Pro", "Core system", "Jobs · techs · time · booking"],
              ["QuickBooks", "Planned", "Revenue · payments"],
              ["Twilio", "Planned", "Customer conversations"],
              ["Booking channels", "Planned", "Lead · appointment outcomes"],
            ].map(([name, status, detail]) => (
              <div
                key={name}
                className="rounded-lg border border-charcoal-200 bg-charcoal-50 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-charcoal-900">
                    {name}
                  </p>
                  <span className="text-[10px] font-medium text-cue-purple-600">
                    {status}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-charcoal-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-cue-purple-200 bg-[#0b1220] p-5 text-white">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-cue-purple-300" />
          <h3 className="text-sm font-semibold">Outcome loop</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          {[
            [
              "1",
              "Work happens",
              "Job, technician, booking, conversation, or service-plan event.",
            ],
            [
              "2",
              "CUE watches",
              "CUE connects related records and checks the business outcome.",
            ],
            [
              "3",
              "Owner acts",
              "A specific action or drill-down is presented.",
            ],
            [
              "4",
              "Outcome returns",
              "The outcome feeds back into the operating picture.",
            ],
          ].map(([n, title, copy]) => (
            <div
              key={n}
              className="rounded-lg border border-white/10 bg-white/5 p-3"
            >
              <span className="text-xs font-bold text-cue-purple-300">{n}</span>
              <p className="mt-2 text-xs font-semibold">{title}</p>
              <p className="mt-1 text-[11px] leading-5 text-charcoal-300">
                {copy}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
