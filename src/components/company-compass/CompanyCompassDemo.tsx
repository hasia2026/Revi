"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Clock3, Compass, FileSearch, History, LockKeyhole, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export type IntelligenceRecommendation = { id: string; status: string; current_version_number: number; required_authority_level: string; approval_required: boolean; source_module: string; created_at: string; updated_at: string };
export type RecommendationVersion = { id: string; recommendation_id: string; version_number: number; observation: string; interpretation: string; recommended_action: string; reasoning_summary: string; expected_outcome: string | null; confidence_level: "low" | "medium" | "high"; confidence_explanation: string; risk_level: "low" | "moderate" | "high" | "prohibited"; risk_explanation: string; assumptions: unknown[]; uncertainties: unknown[]; missing_information: unknown[] };
export type RecommendationEvidence = { id: string; recommendation_version_id: string; source_system: string; observed_at: string | null; retrieved_at: string; freshness_status: "current" | "stale" | "unknown"; relevance_explanation: string; evidence_summary: string; sensitivity: string };
export type CompassLink = { id: string; recommendation_version_id: string; compass_dimension: string; alignment_explanation: string };
export type RecommendationDecision = { id: string; recommendation_id: string; decision: string; decider_membership_role: string; decision_reason: string | null; created_at: string };
export type IntelligenceAuditEvent = { id: string; recommendation_id: string | null; event_type: string; actor_kind: string; event_summary: Record<string, unknown>; occurred_at: string };

type Props = { recommendations: IntelligenceRecommendation[]; versions: RecommendationVersion[]; evidence: RecommendationEvidence[]; compassLinks: CompassLink[]; decisions: RecommendationDecision[]; auditEvents: IntelligenceAuditEvent[]; canApprove: boolean; demoMode?: boolean; dataAccessError?: string | null };

const statusLabels: Record<string, string> = { awaiting_approval: "Awaiting approval", more_information_requested: "More information requested", ready: "Ready" };
const label = (value: string) => statusLabels[value] ?? value.replaceAll("_", " ");
const dateTime = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const toneForRisk = (risk: RecommendationVersion["risk_level"]) => risk === "prohibited" || risk === "high" ? "border-red-200 bg-red-50 text-red-700" : risk === "moderate" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700";
const toneForConfidence = (confidence: RecommendationVersion["confidence_level"]) => confidence === "high" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : confidence === "medium" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-amber-200 bg-amber-50 text-amber-700";

export function CompanyCompassDemo({ recommendations, versions, evidence, compassLinks, decisions, auditEvents, canApprove, demoMode = false, dataAccessError }: Props) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(recommendations[0]?.id ?? null);
  const [decisionFor, setDecisionFor] = useState<string | null>(null);
  const [decisionReason, setDecisionReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const versionsByRecommendation = useMemo(() => new Map(versions.map((version) => [version.recommendation_id, version])), [versions]);
  const awaitingCount = recommendations.filter((item) => item.status === "awaiting_approval").length;
  const approvedCount = recommendations.filter((item) => item.status === "approved").length;
  const measuringCount = recommendations.filter((item) => item.status === "measuring").length;

  async function submitDecision(recommendation: IntelligenceRecommendation, decision: "approved" | "rejected" | "more_information_requested" | "deferred") {
    if (demoMode) return toast.info("Demo mode: no decision was written to the database.");
    if (!canApprove) return toast.error("Owner or admin approval authority is required.");
    if (decision === "rejected" && !decisionReason.trim()) return toast.error("Add a reason before rejecting this recommendation.");
    setSubmitting(true);
    const { error } = await createClient().rpc("decide_intelligence_recommendation", {
      p_recommendation_id: recommendation.id,
      p_expected_version_number: recommendation.current_version_number,
      p_decision: decision,
      p_decision_reason: decisionReason.trim() || null,
      p_modified_action_spec: null,
      p_assigned_to_user_id: null,
      p_request_id: crypto.randomUUID(),
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(`Recommendation ${label(decision)}.`);
    setDecisionFor(null);
    setDecisionReason("");
    router.refresh();
  }

  if (dataAccessError) return (
    <section className="rounded-2xl border border-red-200 bg-white p-8 shadow-sm"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" /><div><h2 className="font-semibold text-charcoal-900">Intelligence could not be loaded</h2><p className="mt-1 text-sm text-charcoal-600">{dataAccessError}</p></div></div></section>
  );

  return <div className="space-y-5">
    {demoMode && <section className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><p className="text-sm font-semibold text-blue-900">Housecall Pro partner demo</p><p className="mt-0.5 text-xs leading-5 text-blue-800">Illustrative scenario only. No customer data is shown, and demo decisions are never written to Supabase.</p></div></section>}
    <section className="rounded-2xl border border-charcoal-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-2xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700"><Sparkles className="h-4 w-4" /> CUE intelligence</div><h2 className="mt-3 text-2xl font-semibold text-charcoal-900">Recommendations you can inspect, decide, and measure.</h2><p className="mt-2 text-sm leading-6 text-charcoal-600">Every recommendation preserves what CUE used, why it reached its conclusion, its confidence and risk, the human decision, and the audit trail that followed.</p></div><div className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-4 lg:min-w-56"><p className="text-xs font-semibold uppercase tracking-wider text-purple-700">Revi authority</p><p className="mt-2 text-sm font-semibold text-charcoal-900">Suggest and prepare</p><p className="mt-1 text-xs leading-5 text-charcoal-600">Execution remains behind explicit authority and approval.</p></div></div>
    </section>

    <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Metric title="Awaiting decision" value={awaitingCount} icon={Clock3} tone="text-amber-700" />
      <Metric title="Approved" value={approvedCount} icon={CheckCircle2} tone="text-emerald-700" />
      <Metric title="Measuring outcomes" value={measuringCount} icon={History} tone="text-blue-700" />
    </section>

    {recommendations.length === 0 ? <section className="rounded-2xl border border-dashed border-charcoal-300 bg-white px-6 py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50"><Compass className="h-6 w-6 text-purple-700" /></div><h3 className="mt-4 text-base font-semibold text-charcoal-900">No recommendations yet</h3><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-charcoal-600">The intelligence foundation is connected. Recommendations will appear here only after they are created with evidence and a Company Compass alignment.</p></section> :
      <section className="space-y-4">{recommendations.map((recommendation) => {
        const version = versionsByRecommendation.get(recommendation.id);
        if (!version) return null;
        const isExpanded = expandedId === recommendation.id;
        const itemEvidence = evidence.filter((item) => item.recommendation_version_id === version.id);
        const itemLinks = compassLinks.filter((item) => item.recommendation_version_id === version.id);
        const itemDecisions = decisions.filter((item) => item.recommendation_id === recommendation.id);
        const itemEvents = auditEvents.filter((item) => item.recommendation_id === recommendation.id);
        const isDecidable = ["awaiting_approval", "ready"].includes(recommendation.status);
        return <article key={recommendation.id} className="overflow-hidden rounded-2xl border border-charcoal-200 bg-white shadow-sm">
          <button type="button" className="flex w-full items-start justify-between gap-4 p-5 text-left hover:bg-charcoal-50" onClick={() => setExpandedId(isExpanded ? null : recommendation.id)} aria-expanded={isExpanded}>
            <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge className="border-charcoal-200 bg-charcoal-50 text-charcoal-700">{label(recommendation.status)}</Badge><Badge className={toneForConfidence(version.confidence_level)}>{version.confidence_level} confidence</Badge><Badge className={toneForRisk(version.risk_level)}>{version.risk_level} risk</Badge></div><h3 className="mt-3 text-base font-semibold text-charcoal-900">{version.recommended_action}</h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-charcoal-600">{version.reasoning_summary}</p></div>{isExpanded ? <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-charcoal-400" /> : <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-charcoal-400" />}
          </button>
          {isExpanded && <div className="border-t border-charcoal-200 p-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2"><Detail title="What CUE observed" text={version.observation} icon={FileSearch} /><Detail title="How CUE interpreted it" text={version.interpretation} icon={Sparkles} /><Detail title="Why CUE recommends this" text={version.reasoning_summary} icon={Compass} /><Detail title="Expected result" text={version.expected_outcome || "No expected outcome recorded."} icon={History} /></div>
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2"><div className="rounded-xl border border-charcoal-200 p-4"><h4 className="flex items-center gap-2 text-sm font-semibold text-charcoal-900"><ShieldCheck className="h-4 w-4 text-emerald-700" /> Confidence and risk</h4><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-charcoal-500">Confidence</p><p className="mt-1 text-sm text-charcoal-700">{version.confidence_explanation}</p><p className="mt-3 text-xs font-semibold uppercase tracking-wider text-charcoal-500">Risk</p><p className="mt-1 text-sm text-charcoal-700">{version.risk_explanation}</p></div><div className="rounded-xl border border-charcoal-200 p-4"><h4 className="flex items-center gap-2 text-sm font-semibold text-charcoal-900"><LockKeyhole className="h-4 w-4 text-purple-700" /> Authority boundary</h4><dl className="mt-3 space-y-2 text-sm"><Row term="Required authority" value={label(recommendation.required_authority_level)} /><Row term="Human approval" value={recommendation.approval_required ? "Required" : "Not required"} /><Row term="Current state" value={label(recommendation.status)} /></dl></div></div>
            <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3"><RecordList title="Evidence used" empty="No visible evidence" items={itemEvidence.map((item) => ({ title: item.source_system, body: item.evidence_summary, meta: `${label(item.freshness_status)} · retrieved ${dateTime(item.retrieved_at)}` }))} /><RecordList title="Compass alignment" empty="No Compass link" items={itemLinks.map((item) => ({ title: label(item.compass_dimension), body: item.alignment_explanation }))} /><RecordList title="Decision and audit trail" empty="No decision recorded" items={[...itemDecisions.map((item) => ({ title: label(item.decision), body: item.decision_reason || `Recorded by a ${item.decider_membership_role}.`, meta: dateTime(item.created_at) })), ...itemEvents.slice(0, 4).map((item) => ({ title: label(item.event_type), body: `Actor: ${label(item.actor_kind)}`, meta: dateTime(item.occurred_at) }))]} /></div>
            {isDecidable && <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h4 className="text-sm font-semibold text-charcoal-900">Human decision required</h4><p className="mt-1 text-xs text-charcoal-600">{canApprove ? "Your decision will be permanently recorded in the audit trail." : "Only a business owner or admin can decide this recommendation."}</p></div>{canApprove && <div className="flex flex-wrap gap-2"><Button size="sm" variant="cue" onClick={() => submitDecision(recommendation, "approved")} loading={submitting}>Approve</Button><Button size="sm" variant="secondary" onClick={() => setDecisionFor(recommendation.id)}>Other decision</Button></div>}</div>
              {decisionFor === recommendation.id && <div className="mt-4 border-t border-purple-200 pt-4"><label className="text-xs font-semibold text-charcoal-700" htmlFor={`decision-reason-${recommendation.id}`}>Reason or information needed</label><textarea id={`decision-reason-${recommendation.id}`} value={decisionReason} onChange={(event) => setDecisionReason(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-charcoal-300 bg-white px-3 py-2 text-sm text-charcoal-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200" placeholder="Explain why you are rejecting, deferring, or requesting more information." /><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="danger" onClick={() => submitDecision(recommendation, "rejected")} loading={submitting}><XCircle className="h-4 w-4" /> Reject</Button><Button size="sm" variant="secondary" onClick={() => submitDecision(recommendation, "more_information_requested")} loading={submitting}>Request information</Button><Button size="sm" variant="ghost" onClick={() => submitDecision(recommendation, "deferred")} loading={submitting}>Defer</Button><Button size="sm" variant="ghost" onClick={() => { setDecisionFor(null); setDecisionReason(""); }}>Cancel</Button></div></div>}
            </div>}
          </div>}
        </article>;
      })}</section>}
  </div>;
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) { return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${className}`}>{children}</span>; }
function Metric({ title, value, icon: Icon, tone }: { title: string; value: number; icon: typeof Clock3; tone: string }) { return <div className="rounded-xl border border-charcoal-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-medium text-charcoal-600">{title}</p><Icon className={`h-4 w-4 ${tone}`} /></div><p className="mt-3 text-2xl font-semibold text-charcoal-900">{value}</p></div>; }
function Detail({ title, text, icon: Icon }: { title: string; text: string; icon: typeof Compass }) { return <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-4"><h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-charcoal-600"><Icon className="h-4 w-4" /> {title}</h4><p className="mt-2 text-sm leading-6 text-charcoal-800">{text}</p></div>; }
function Row({ term, value }: { term: string; value: string }) { return <div className="flex justify-between gap-4"><dt className="text-charcoal-500">{term}</dt><dd className="font-medium capitalize text-charcoal-900">{value}</dd></div>; }
function RecordList({ title, items, empty }: { title: string; items: Array<{ title: string; body: string; meta?: string }>; empty: string }) { return <div className="rounded-xl border border-charcoal-200 p-4"><h4 className="text-sm font-semibold text-charcoal-900">{title}</h4><div className="mt-3 space-y-3">{items.length === 0 ? <p className="text-xs text-charcoal-500">{empty}</p> : items.map((item, index) => <div key={`${item.title}-${index}`} className="border-l-2 border-purple-200 pl-3"><p className="text-xs font-semibold capitalize text-charcoal-900">{item.title}</p><p className="mt-1 text-xs leading-5 text-charcoal-600">{item.body}</p>{item.meta && <p className="mt-1 text-[10px] text-charcoal-400">{item.meta}</p>}</div>)}</div></div>; }
