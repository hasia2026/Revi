import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import {
  CompanyCompassDemo,
  type CompassLink,
  type IntelligenceAuditEvent,
  type IntelligenceRecommendation,
  type RecommendationDecision,
  type RecommendationEvidence,
  type RecommendationVersion,
} from "@/components/company-compass/CompanyCompassDemo";

export default async function CompanyCompassPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string | string[] }>;
}) {
  const demoParam = (await searchParams).demo;
  const demoMode = demoParam === "housecall-pro";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (demoMode && !user) {
    return (
      <CompanyCompassDemo
        {...housecallProDemo}
        canApprove={false}
        demoMode
        dataAccessError={null}
      />
    );
  }

  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("business_members")
      .select("business_id, role, businesses(name)")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle(),
  ]);
  if (!memberRes.data?.business_id) redirect("/setup");

  const businessId = memberRes.data.business_id;
  const business = memberRes.data.businesses as unknown as {
    name: string;
  } | null;
  const recommendationRes = await supabase
    .from("intelligence_recommendations")
    .select(
      "id, status, current_version_number, required_authority_level, approval_required, source_module, created_at, updated_at",
    )
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false })
    .limit(50);
  const recommendations = (recommendationRes.data ??
    []) as IntelligenceRecommendation[];
  const recommendationIds = recommendations.map((item) => item.id);

  let versions: RecommendationVersion[] = [];
  let evidence: RecommendationEvidence[] = [];
  let compassLinks: CompassLink[] = [];
  let decisions: RecommendationDecision[] = [];
  let auditEvents: IntelligenceAuditEvent[] = [];
  let relatedError: string | null = null;

  if (recommendationIds.length > 0) {
    const versionRes = await supabase
      .from("recommendation_versions")
      .select(
        "id, recommendation_id, version_number, observation, interpretation, recommended_action, reasoning_summary, expected_outcome, confidence_level, confidence_explanation, risk_level, risk_explanation, assumptions, uncertainties, missing_information",
      )
      .in("recommendation_id", recommendationIds)
      .order("version_number", { ascending: false });
    const allVersions = (versionRes.data ?? []) as RecommendationVersion[];
    versions = recommendations
      .map((recommendation) =>
        allVersions.find(
          (version) =>
            version.recommendation_id === recommendation.id &&
            version.version_number === recommendation.current_version_number,
        ),
      )
      .filter((version): version is RecommendationVersion => Boolean(version));
    const versionIds = versions.map((version) => version.id);

    const [evidenceRes, compassRes, decisionRes, auditRes] = await Promise.all([
      versionIds.length
        ? supabase
            .from("recommendation_evidence")
            .select(
              "id, recommendation_version_id, source_system, observed_at, retrieved_at, freshness_status, relevance_explanation, evidence_summary, sensitivity",
            )
            .in("recommendation_version_id", versionIds)
            .order("retrieved_at", { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      versionIds.length
        ? supabase
            .from("recommendation_compass_links")
            .select(
              "id, recommendation_version_id, compass_dimension, alignment_explanation",
            )
            .in("recommendation_version_id", versionIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      supabase
        .from("recommendation_decisions")
        .select(
          "id, recommendation_id, decision, decider_membership_role, decision_reason, created_at",
        )
        .in("recommendation_id", recommendationIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("intelligence_audit_events")
        .select(
          "id, recommendation_id, event_type, actor_kind, event_summary, occurred_at",
        )
        .in("recommendation_id", recommendationIds)
        .order("occurred_at", { ascending: false })
        .limit(200),
    ]);

    evidence = (evidenceRes.data ?? []) as RecommendationEvidence[];
    compassLinks = (compassRes.data ?? []) as CompassLink[];
    decisions = (decisionRes.data ?? []) as RecommendationDecision[];
    auditEvents = (auditRes.data ?? []) as IntelligenceAuditEvent[];
    relatedError =
      versionRes.error?.message ||
      evidenceRes.error?.message ||
      compassRes.error?.message ||
      decisionRes.error?.message ||
      auditRes.error?.message ||
      null;
  }

  const role = memberRes.data.role?.toLowerCase();
  const displayed = demoMode
    ? housecallProDemo
    : {
        recommendations,
        versions,
        evidence,
        compassLinks,
        decisions,
        auditEvents,
      };
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TopBar
        title="Company Compass"
        subtitle={
          business?.name
            ? `Business intelligence for ${business.name}`
            : "Your business. Your intelligence."
        }
        userName={profileRes.data?.full_name}
        userEmail={user.email}
      />
      <div className="flex-1 overflow-y-auto bg-charcoal-50 p-6">
        <CompanyCompassDemo
          {...displayed}
          canApprove={demoMode || role === "owner" || role === "admin"}
          demoMode={demoMode}
          dataAccessError={
            demoMode ? null : recommendationRes.error?.message || relatedError
          }
        />
      </div>
    </div>
  );
}

const demoRecommendations: IntelligenceRecommendation[] = [
  ["demo-missed-call", "execute_with_approval"],
  ["demo-estimates", "prepare"],
  ["demo-reviews", "prepare"],
].map(([id, required_authority_level], index) => ({
  id,
  status: "awaiting_approval",
  current_version_number: 1,
  required_authority_level,
  approval_required: true,
  source_module: "company_compass",
  created_at: `2026-09-14T09:0${index}:00Z`,
  updated_at: `2026-09-14T09:0${index}:00Z`,
}));

const demoVersions: RecommendationVersion[] = [
  {
    id: "demo-v-missed-call",
    recommendation_id: "demo-missed-call",
    version_number: 1,
    observation:
      "A high-intent prospect called four minutes ago and did not reach the business.",
    interpretation:
      "The lead is still inside the highest-value callback window and may otherwise contact another provider.",
    recommended_action: "Return the high-intent missed call now",
    reasoning_summary:
      "Fast follow-up protects demand already captured by Housecall Pro and reduces avoidable lead leakage.",
    expected_outcome:
      "Start a conversation and convert the inquiry into an estimate or booked job.",
    confidence_level: "high",
    confidence_explanation:
      "The missed-call timestamp and unmatched customer record are current and directly relevant.",
    risk_level: "moderate",
    risk_explanation:
      "Calling a customer is an external communication, so CUE requires human approval before execution.",
    assumptions: [],
    uncertainties: ["The caller's exact service need is not yet known."],
    missing_information: [],
  },
  {
    id: "demo-v-estimates",
    recommendation_id: "demo-estimates",
    version_number: 1,
    observation:
      "Four open estimates totaling $7,800 have received no recorded follow-up.",
    interpretation:
      "Booked work is down while viable quoted demand remains undecided.",
    recommended_action: "Prepare follow-ups for four open estimates",
    reasoning_summary:
      "Prioritizing the two highest-value estimates can recover near-term revenue without increasing acquisition spend.",
    expected_outcome:
      "Move open estimates toward a customer decision and improve the booked-job pipeline.",
    confidence_level: "high",
    confidence_explanation:
      "Estimate value, status, and last-contact history come directly from the operating record.",
    risk_level: "moderate",
    risk_explanation:
      "CUE may prepare the messages, but a person must approve external customer communication.",
    assumptions: [],
    uncertainties: [],
    missing_information: [
      "Customer-specific objections have not been recorded for every estimate.",
    ],
  },
  {
    id: "demo-v-reviews",
    recommendation_id: "demo-reviews",
    version_number: 1,
    observation:
      "Twelve completed jobs have no open issue and no recorded review request.",
    interpretation:
      "Satisfied customers represent an unused reputation opportunity.",
    recommended_action: "Prepare review requests for 12 satisfied customers",
    reasoning_summary:
      "Timely review requests can strengthen local trust while the completed service is still fresh.",
    expected_outcome:
      "Increase recent review volume and improve local conversion confidence.",
    confidence_level: "medium",
    confidence_explanation:
      "Completion status is known, but satisfaction is inferred from the absence of an open issue.",
    risk_level: "moderate",
    risk_explanation:
      "Customer outreach requires approval, and customers with unresolved concerns must be excluded.",
    assumptions: [
      "No open issue is a reasonable—but imperfect—satisfaction signal.",
    ],
    uncertainties: [
      "Some customers may have concerns outside the recorded workflow.",
    ],
    missing_information: [],
  },
];

const demoEvidence: RecommendationEvidence[] = [
  {
    id: "demo-e-call",
    recommendation_version_id: "demo-v-missed-call",
    source_system: "Housecall Pro + phone event",
    observed_at: "2026-09-14T09:00:00Z",
    retrieved_at: "2026-09-14T09:04:00Z",
    freshness_status: "current",
    relevance_explanation: "Connects the missed call to the lead workflow.",
    evidence_summary:
      "Inbound call was unanswered and no matching conversation or job was created.",
    sensitivity: "standard",
  },
  {
    id: "demo-e-estimates",
    recommendation_version_id: "demo-v-estimates",
    source_system: "Housecall Pro estimates",
    observed_at: "2026-09-14T08:45:00Z",
    retrieved_at: "2026-09-14T09:01:00Z",
    freshness_status: "current",
    relevance_explanation: "Shows undecided quoted demand.",
    evidence_summary:
      "Four estimates remain open, totaling $7,800, with no recent follow-up activity.",
    sensitivity: "standard",
  },
  {
    id: "demo-e-reviews",
    recommendation_version_id: "demo-v-reviews",
    source_system: "Housecall Pro job history",
    observed_at: "2026-09-13T23:00:00Z",
    retrieved_at: "2026-09-14T09:02:00Z",
    freshness_status: "current",
    relevance_explanation:
      "Identifies completed jobs eligible for review screening.",
    evidence_summary:
      "Twelve completed jobs have no open issue and no review request event.",
    sensitivity: "standard",
  },
];

const demoCompassLinks: CompassLink[] = demoVersions.map((version, index) => ({
  id: `demo-c-${index}`,
  recommendation_version_id: version.id,
  compass_dimension: index === 1 ? "kpi" : "customer_promise",
  alignment_explanation:
    index === 1
      ? "Supports the Compass priority to protect near-term booked revenue."
      : "Supports responsive, trustworthy customer service without removing human judgment.",
}));
const demoAuditEvents: IntelligenceAuditEvent[] = demoRecommendations.map(
  (recommendation, index) => ({
    id: `demo-a-${index}`,
    recommendation_id: recommendation.id,
    event_type: "recommendation.created",
    actor_kind: "revi",
    event_summary: { demo: true },
    occurred_at: recommendation.created_at,
  }),
);
const housecallProDemo = {
  recommendations: demoRecommendations,
  versions: demoVersions,
  evidence: demoEvidence,
  compassLinks: demoCompassLinks,
  decisions: [] as RecommendationDecision[],
  auditEvents: demoAuditEvents,
};
