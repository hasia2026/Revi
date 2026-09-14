import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/layout/TopBar";
import { CompanyCompassDemo, type CompassLink, type IntelligenceAuditEvent, type IntelligenceRecommendation, type RecommendationDecision, type RecommendationEvidence, type RecommendationVersion } from "@/components/company-compass/CompanyCompassDemo";

export default async function CompanyCompassPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileRes, memberRes] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("business_members").select("business_id, role, businesses(name)").eq("user_id", user.id).limit(1).maybeSingle(),
  ]);
  if (!memberRes.data?.business_id) redirect("/setup");

  const businessId = memberRes.data.business_id;
  const business = memberRes.data.businesses as unknown as { name: string } | null;
  const recommendationRes = await supabase.from("intelligence_recommendations").select("id, status, current_version_number, required_authority_level, approval_required, source_module, created_at, updated_at").eq("business_id", businessId).order("updated_at", { ascending: false }).limit(50);
  const recommendations = (recommendationRes.data ?? []) as IntelligenceRecommendation[];
  const recommendationIds = recommendations.map((item) => item.id);

  let versions: RecommendationVersion[] = [];
  let evidence: RecommendationEvidence[] = [];
  let compassLinks: CompassLink[] = [];
  let decisions: RecommendationDecision[] = [];
  let auditEvents: IntelligenceAuditEvent[] = [];
  let relatedError: string | null = null;

  if (recommendationIds.length > 0) {
    const versionRes = await supabase.from("recommendation_versions").select("id, recommendation_id, version_number, observation, interpretation, recommended_action, reasoning_summary, expected_outcome, confidence_level, confidence_explanation, risk_level, risk_explanation, assumptions, uncertainties, missing_information").in("recommendation_id", recommendationIds).order("version_number", { ascending: false });
    const allVersions = (versionRes.data ?? []) as RecommendationVersion[];
    versions = recommendations.map((recommendation) => allVersions.find((version) => version.recommendation_id === recommendation.id && version.version_number === recommendation.current_version_number)).filter((version): version is RecommendationVersion => Boolean(version));
    const versionIds = versions.map((version) => version.id);

    const [evidenceRes, compassRes, decisionRes, auditRes] = await Promise.all([
      versionIds.length ? supabase.from("recommendation_evidence").select("id, recommendation_version_id, source_system, observed_at, retrieved_at, freshness_status, relevance_explanation, evidence_summary, sensitivity").in("recommendation_version_id", versionIds).order("retrieved_at", { ascending: false }) : Promise.resolve({ data: [], error: null }),
      versionIds.length ? supabase.from("recommendation_compass_links").select("id, recommendation_version_id, compass_dimension, alignment_explanation").in("recommendation_version_id", versionIds).order("created_at", { ascending: true }) : Promise.resolve({ data: [], error: null }),
      supabase.from("recommendation_decisions").select("id, recommendation_id, decision, decider_membership_role, decision_reason, created_at").in("recommendation_id", recommendationIds).order("created_at", { ascending: false }),
      supabase.from("intelligence_audit_events").select("id, recommendation_id, event_type, actor_kind, event_summary, occurred_at").in("recommendation_id", recommendationIds).order("occurred_at", { ascending: false }).limit(200),
    ]);

    evidence = (evidenceRes.data ?? []) as RecommendationEvidence[];
    compassLinks = (compassRes.data ?? []) as CompassLink[];
    decisions = (decisionRes.data ?? []) as RecommendationDecision[];
    auditEvents = (auditRes.data ?? []) as IntelligenceAuditEvent[];
    relatedError = versionRes.error?.message || evidenceRes.error?.message || compassRes.error?.message || decisionRes.error?.message || auditRes.error?.message || null;
  }

  const role = memberRes.data.role?.toLowerCase();
  return <div className="flex h-full flex-col overflow-hidden">
    <TopBar title="Company Compass" subtitle={business?.name ? `Business intelligence for ${business.name}` : "Your business. Your intelligence."} userName={profileRes.data?.full_name} userEmail={user.email} />
    <div className="flex-1 overflow-y-auto bg-charcoal-50 p-6"><CompanyCompassDemo recommendations={recommendations} versions={versions} evidence={evidence} compassLinks={compassLinks} decisions={decisions} auditEvents={auditEvents} canApprove={role === "owner" || role === "admin"} dataAccessError={recommendationRes.error?.message || relatedError} /></div>
  </div>;
}
