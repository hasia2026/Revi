-- CUE Company Compass Intelligence — Phase 1 proposal
-- Approved repository migration. Apply to Supabase only after separate explicit approval.
-- Repository baseline reviewed: hasia2026/Revi @ c317b8f

begin;

-- Privileged helpers and trigger functions live outside the exposed public
-- schema. The two public mutation RPCs below remain the only client entrypoints.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Root record: lifecycle pointer only. Material recommendation content is versioned.
create table public.intelligence_recommendations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  recommendation_key text,
  status text not null default 'draft' check (status in (
    'draft','ready','awaiting_approval','approved','rejected','superseded',
    'scheduled','executing','completed','failed','cancelled','measuring','closed'
  )),
  current_version_number integer not null default 1 check (current_version_number > 0),
  required_authority_level text not null default 'suggest' check (required_authority_level in (
    'view','explain','suggest','prepare','execute_with_approval','execute_automatically'
  )),
  approval_required boolean not null default true,
  created_by_kind text not null check (created_by_kind in ('user','cue','integration','system')),
  created_by_user_id uuid references auth.users(id) on delete set null,
  source_module text not null default 'company_compass',
  related_entity_type text,
  related_entity_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz,
  unique (id, business_id),
  check (created_by_kind <> 'user' or created_by_user_id is not null)
);

create table public.recommendation_versions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  recommendation_id uuid not null,
  version_number integer not null check (version_number > 0),
  observation text not null,
  interpretation text not null,
  recommended_action text not null,
  reasoning_summary text not null,
  expected_outcome text,
  confidence_level text not null check (confidence_level in ('low','medium','high')),
  confidence_explanation text not null,
  risk_level text not null check (risk_level in ('low','moderate','high','prohibited')),
  risk_explanation text not null,
  assumptions jsonb not null default '[]'::jsonb check (jsonb_typeof(assumptions) = 'array'),
  uncertainties jsonb not null default '[]'::jsonb check (jsonb_typeof(uncertainties) = 'array'),
  missing_information jsonb not null default '[]'::jsonb check (jsonb_typeof(missing_information) = 'array'),
  conflicting_information jsonb not null default '[]'::jsonb check (jsonb_typeof(conflicting_information) = 'array'),
  proposed_action_spec jsonb not null default '{}'::jsonb check (jsonb_typeof(proposed_action_spec) = 'object'),
  created_by_kind text not null check (created_by_kind in ('user','cue','integration','system')),
  created_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (recommendation_id, business_id)
    references public.intelligence_recommendations(id, business_id) on delete restrict,
  unique (recommendation_id, version_number),
  unique (id, business_id),
  check (created_by_kind <> 'user' or created_by_user_id is not null)
);

create table public.recommendation_evidence (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  recommendation_version_id uuid not null,
  source_system text not null,
  source_record_type text,
  source_record_id text,
  observed_at timestamptz,
  retrieved_at timestamptz not null default now(),
  freshness_status text not null default 'unknown' check (freshness_status in ('current','stale','unknown')),
  relevance_explanation text not null,
  evidence_summary text not null,
  evidence_snapshot jsonb,
  content_hash text,
  sensitivity text not null default 'standard' check (sensitivity in ('standard','sensitive','restricted')),
  retention_class text,
  created_at timestamptz not null default now(),
  foreign key (recommendation_version_id, business_id)
    references public.recommendation_versions(id, business_id) on delete restrict
);

create table public.recommendation_compass_links (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  recommendation_version_id uuid not null,
  compass_dimension text not null check (compass_dimension in (
    'mission','vision','value','promise','principle','goal','kpi','priority',
    'standard','constraint','risk_tolerance'
  )),
  compass_record_type text,
  compass_record_id uuid,
  compass_snapshot jsonb not null check (jsonb_typeof(compass_snapshot) = 'object'),
  alignment_explanation text not null,
  created_at timestamptz not null default now(),
  foreign key (recommendation_version_id, business_id)
    references public.recommendation_versions(id, business_id) on delete restrict
);

create table public.recommendation_decisions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  recommendation_id uuid not null,
  recommendation_version_id uuid not null,
  decision text not null check (decision in (
    'approved','rejected','modified','more_information_requested','deferred','reassigned'
  )),
  decided_by_user_id uuid not null references auth.users(id) on delete restrict,
  decider_membership_role text not null,
  decision_reason text,
  modified_action_spec jsonb,
  assigned_to_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (recommendation_id, business_id)
    references public.intelligence_recommendations(id, business_id) on delete restrict,
  foreign key (recommendation_version_id, business_id)
    references public.recommendation_versions(id, business_id) on delete restrict,
  unique (id, business_id),
  check (decision not in ('rejected','modified') or nullif(btrim(decision_reason), '') is not null),
  check (decision <> 'modified' or (modified_action_spec is not null and jsonb_typeof(modified_action_spec) = 'object')),
  check (decision <> 'reassigned' or assigned_to_user_id is not null)
);

create table public.intelligence_audit_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete restrict,
  event_type text not null,
  actor_kind text not null check (actor_kind in ('user','revi','system','integration')),
  actor_user_id uuid references auth.users(id) on delete set null,
  recommendation_id uuid,
  recommendation_version_id uuid,
  decision_id uuid,
  event_summary jsonb not null default '{}'::jsonb check (jsonb_typeof(event_summary) = 'object'),
  request_id text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key (recommendation_id, business_id)
    references public.intelligence_recommendations(id, business_id) on delete restrict,
  foreign key (recommendation_version_id, business_id)
    references public.recommendation_versions(id, business_id) on delete restrict,
  foreign key (decision_id, business_id)
    references public.recommendation_decisions(id, business_id) on delete restrict,
  check (actor_kind <> 'user' or actor_user_id is not null)
);

create index intelligence_recommendations_business_status_created_idx
  on public.intelligence_recommendations (business_id, status, created_at desc);
create index intelligence_recommendations_approval_queue_idx
  on public.intelligence_recommendations (business_id, approval_required, status, created_at desc);
create index recommendation_versions_recommendation_version_idx
  on public.recommendation_versions (recommendation_id, version_number desc);
create index recommendation_evidence_version_created_idx
  on public.recommendation_evidence (recommendation_version_id, created_at);
create index recommendation_compass_links_version_idx
  on public.recommendation_compass_links (recommendation_version_id);
create index recommendation_decisions_recommendation_created_idx
  on public.recommendation_decisions (recommendation_id, created_at desc);
create index intelligence_audit_events_business_occurred_idx
  on public.intelligence_audit_events (business_id, occurred_at desc);
create index intelligence_audit_events_recommendation_idx
  on public.intelligence_audit_events (recommendation_id, occurred_at);

alter table public.intelligence_recommendations enable row level security;
alter table public.recommendation_versions enable row level security;
alter table public.recommendation_evidence enable row level security;
alter table public.recommendation_compass_links enable row level security;
alter table public.recommendation_decisions enable row level security;
alter table public.intelligence_audit_events enable row level security;

-- Root recommendation summaries are visible to business members.
create policy "Members read intelligence recommendations"
  on public.intelligence_recommendations for select
  to authenticated
  using ((select public.is_business_member(business_id)));

create policy "Members read recommendation versions"
  on public.recommendation_versions for select
  to authenticated
  using ((select public.is_business_member(business_id)));

-- Phase 1 allows members to read standard evidence only. Sensitive/restricted
-- evidence stays server-side until a dedicated capability model is approved.
create policy "Members read standard recommendation evidence"
  on public.recommendation_evidence for select
  to authenticated
  using ((select public.is_business_member(business_id)) and sensitivity = 'standard');

create policy "Members read recommendation compass links"
  on public.recommendation_compass_links for select
  to authenticated
  using ((select public.is_business_member(business_id)));

create policy "Members read recommendation decisions"
  on public.recommendation_decisions for select
  to authenticated
  using ((select public.is_business_member(business_id)));

create policy "Members read intelligence audit events"
  on public.intelligence_audit_events for select
  to authenticated
  using ((select public.is_business_member(business_id)));

revoke all on public.intelligence_recommendations from anon, authenticated;
revoke all on public.recommendation_versions from anon, authenticated;
revoke all on public.recommendation_evidence from anon, authenticated;
revoke all on public.recommendation_compass_links from anon, authenticated;
revoke all on public.recommendation_decisions from anon, authenticated;
revoke all on public.intelligence_audit_events from anon, authenticated;

grant select on public.intelligence_recommendations to authenticated;
grant select on public.recommendation_versions to authenticated;
grant select on public.recommendation_evidence to authenticated;
grant select on public.recommendation_compass_links to authenticated;
grant select on public.recommendation_decisions to authenticated;
grant select on public.intelligence_audit_events to authenticated;

-- Immutable tables reject mutation even if a future grant/policy is loosened.
create or replace function private.reject_intelligence_immutable_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'immutable intelligence record cannot be updated or deleted';
end;
$$;

create trigger recommendation_versions_immutable
before update or delete on public.recommendation_versions
for each row execute function private.reject_intelligence_immutable_mutation();
create trigger recommendation_evidence_immutable
before update or delete on public.recommendation_evidence
for each row execute function private.reject_intelligence_immutable_mutation();
create trigger recommendation_compass_links_immutable
before update or delete on public.recommendation_compass_links
for each row execute function private.reject_intelligence_immutable_mutation();
create trigger recommendation_decisions_immutable
before update or delete on public.recommendation_decisions
for each row execute function private.reject_intelligence_immutable_mutation();
create trigger intelligence_audit_events_immutable
before update or delete on public.intelligence_audit_events
for each row execute function private.reject_intelligence_immutable_mutation();

-- Conservative Phase 1 approver rule. Must be verified against live role values.
create or replace function private.is_business_intelligence_approver(p_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = p_business_id
      and bm.user_id = (select auth.uid())
      and lower(bm.role) in ('owner', 'admin')
  );
$$;

revoke all on function private.is_business_intelligence_approver(uuid) from public, anon, authenticated;

-- Phase 1 creation contract. Evidence and Compass links arrive as JSON arrays;
-- each item is validated and inserted in the same transaction.
create or replace function public.create_intelligence_recommendation(
  p_business_id uuid,
  p_observation text,
  p_interpretation text,
  p_recommended_action text,
  p_reasoning_summary text,
  p_expected_outcome text,
  p_confidence_level text,
  p_confidence_explanation text,
  p_risk_level text,
  p_risk_explanation text,
  p_required_authority_level text default 'suggest',
  p_approval_required boolean default true,
  p_source_module text default 'company_compass',
  p_assumptions jsonb default '[]'::jsonb,
  p_uncertainties jsonb default '[]'::jsonb,
  p_missing_information jsonb default '[]'::jsonb,
  p_conflicting_information jsonb default '[]'::jsonb,
  p_proposed_action_spec jsonb default '{}'::jsonb,
  p_evidence jsonb default '[]'::jsonb,
  p_compass_links jsonb default '[]'::jsonb,
  p_request_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_recommendation_id uuid;
  v_version_id uuid;
  v_created_by_kind text;
begin
  if v_user_id is null or not public.is_business_member(p_business_id) then
    raise exception 'not authorized for this business';
  end if;
  if p_risk_level = 'prohibited' and p_required_authority_level in ('execute_with_approval','execute_automatically') then
    raise exception 'prohibited recommendation cannot request execution authority';
  end if;
  if jsonb_typeof(p_evidence) <> 'array' or jsonb_typeof(p_compass_links) <> 'array' then
    raise exception 'evidence and compass links must be arrays';
  end if;
  if jsonb_array_length(p_evidence) = 0 then
    raise exception 'at least one evidence record is required';
  end if;
  if jsonb_array_length(p_compass_links) = 0 then
    raise exception 'at least one Company Compass alignment is required';
  end if;

  v_created_by_kind := 'user';
  insert into public.intelligence_recommendations (
    business_id, status, required_authority_level, approval_required,
    created_by_kind, created_by_user_id, source_module
  ) values (
    p_business_id,
    case when p_approval_required then 'awaiting_approval' else 'ready' end,
    p_required_authority_level, p_approval_required,
    v_created_by_kind, v_user_id, p_source_module
  ) returning id into v_recommendation_id;

  insert into public.recommendation_versions (
    business_id, recommendation_id, version_number, observation, interpretation,
    recommended_action, reasoning_summary, expected_outcome, confidence_level,
    confidence_explanation, risk_level, risk_explanation, assumptions, uncertainties,
    missing_information, conflicting_information, proposed_action_spec,
    created_by_kind, created_by_user_id
  ) values (
    p_business_id, v_recommendation_id, 1, p_observation, p_interpretation,
    p_recommended_action, p_reasoning_summary, p_expected_outcome, p_confidence_level,
    p_confidence_explanation, p_risk_level, p_risk_explanation, p_assumptions,
    p_uncertainties, p_missing_information, p_conflicting_information,
    p_proposed_action_spec, v_created_by_kind, v_user_id
  ) returning id into v_version_id;

  insert into public.recommendation_evidence (
    business_id, recommendation_version_id, source_system, source_record_type,
    source_record_id, observed_at, retrieved_at, freshness_status,
    relevance_explanation, evidence_summary, evidence_snapshot, content_hash,
    sensitivity, retention_class
  )
  select p_business_id, v_version_id,
    e->>'source_system', e->>'source_record_type', e->>'source_record_id',
    nullif(e->>'observed_at','')::timestamptz,
    coalesce(nullif(e->>'retrieved_at','')::timestamptz, now()),
    coalesce(e->>'freshness_status','unknown'), e->>'relevance_explanation',
    e->>'evidence_summary', e->'evidence_snapshot', e->>'content_hash',
    coalesce(e->>'sensitivity','standard'), e->>'retention_class'
  from jsonb_array_elements(p_evidence) e;

  insert into public.recommendation_compass_links (
    business_id, recommendation_version_id, compass_dimension,
    compass_record_type, compass_record_id, compass_snapshot, alignment_explanation
  )
  select p_business_id, v_version_id, c->>'compass_dimension',
    c->>'compass_record_type', nullif(c->>'compass_record_id','')::uuid,
    c->'compass_snapshot', c->>'alignment_explanation'
  from jsonb_array_elements(p_compass_links) c;

  insert into public.intelligence_audit_events (
    business_id, event_type, actor_kind, actor_user_id, recommendation_id,
    recommendation_version_id, event_summary, request_id
  ) values (
    p_business_id, 'recommendation.created', 'user', v_user_id,
    v_recommendation_id, v_version_id,
    jsonb_build_object('version_number', 1, 'status', case when p_approval_required then 'awaiting_approval' else 'ready' end),
    p_request_id
  );

  return v_recommendation_id;
end;
$$;

revoke all on function public.create_intelligence_recommendation(
  uuid,text,text,text,text,text,text,text,text,text,text,boolean,text,
  jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,text
) from public, anon;
grant execute on function public.create_intelligence_recommendation(
  uuid,text,text,text,text,text,text,text,text,text,text,boolean,text,
  jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,text
) to authenticated;

create or replace function public.decide_intelligence_recommendation(
  p_recommendation_id uuid,
  p_expected_version_number integer,
  p_decision text,
  p_decision_reason text default null,
  p_modified_action_spec jsonb default null,
  p_assigned_to_user_id uuid default null,
  p_request_id text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_rec public.intelligence_recommendations%rowtype;
  v_version_id uuid;
  v_role text;
  v_decision_id uuid;
  v_new_status text;
begin
  select * into v_rec
  from public.intelligence_recommendations
  where id = p_recommendation_id
  for update;

  if not found then raise exception 'recommendation not found'; end if;
  if v_user_id is null or not private.is_business_intelligence_approver(v_rec.business_id) then
    raise exception 'approval authority required';
  end if;
  if v_rec.current_version_number <> p_expected_version_number then
    raise exception 'recommendation version changed; review the current version';
  end if;
  if v_rec.status not in ('awaiting_approval','ready','approved') then
    raise exception 'recommendation is not currently decidable';
  end if;
  -- Material modification requires a new recommendation version. That revision
  -- RPC is intentionally outside this first proposal, so modification is not
  -- accepted through this function.
  if p_decision not in ('approved','rejected','more_information_requested','deferred','reassigned') then
    raise exception 'invalid decision';
  end if;
  if p_decision = 'rejected' and nullif(btrim(p_decision_reason),'') is null then
    raise exception 'decision reason is required';
  end if;

  select id into v_version_id
  from public.recommendation_versions
  where recommendation_id = v_rec.id and version_number = p_expected_version_number;

  select role into v_role
  from public.business_members
  where business_id = v_rec.business_id and user_id = v_user_id
  limit 1;

  insert into public.recommendation_decisions (
    business_id, recommendation_id, recommendation_version_id, decision,
    decided_by_user_id, decider_membership_role, decision_reason,
    modified_action_spec, assigned_to_user_id
  ) values (
    v_rec.business_id, v_rec.id, v_version_id, p_decision,
    v_user_id, v_role, p_decision_reason, p_modified_action_spec, p_assigned_to_user_id
  ) returning id into v_decision_id;

  v_new_status := case p_decision
    when 'approved' then 'approved'
    when 'rejected' then 'rejected'
    else 'awaiting_approval'
  end;

  update public.intelligence_recommendations
  set status = v_new_status, updated_at = now()
  where id = v_rec.id;

  insert into public.intelligence_audit_events (
    business_id, event_type, actor_kind, actor_user_id, recommendation_id,
    recommendation_version_id, decision_id, event_summary, request_id
  ) values (
    v_rec.business_id, 'recommendation.' || p_decision, 'user', v_user_id,
    v_rec.id, v_version_id, v_decision_id,
    jsonb_build_object('version_number', p_expected_version_number, 'new_status', v_new_status),
    p_request_id
  );

  return v_decision_id;
end;
$$;

revoke all on function public.decide_intelligence_recommendation(uuid,integer,text,text,jsonb,uuid,text) from public, anon;
grant execute on function public.decide_intelligence_recommendation(uuid,integer,text,text,jsonb,uuid,text) to authenticated;

commit;

-- End proposal. This file intentionally contains no DROP/rollback execution.
