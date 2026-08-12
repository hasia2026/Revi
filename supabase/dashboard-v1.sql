-- Dashboard v1: Priorities + Notifications
-- Run manually in Supabase SQL Editor, same as company_compass.sql.

-- ============================================================
-- Priorities: manual + AI-sourced, same table, distinguished by
-- `source`. This is what "Today's Priorities" reads from. The
-- 'cue' source rows stay empty until the Phase 2 AI gateway exists
-- to generate them - the table and UI don't need to change when
-- that lands, only a new insert path gets added.
-- ============================================================

create table if not exists public.priorities (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  source text not null default 'user' check (source in ('user', 'cue')),
  status text not null default 'open' check (status in ('open', 'complete')),
  pinned boolean not null default false,
  assigned_to uuid references auth.users(id) on delete set null,
  due_date date,
  -- Generic pointer to whatever created this priority (a guest request,
  -- a maintenance ticket, a shift-handoff item, etc.) once those exist.
  -- No foreign key constraint on purpose — the referenced table varies
  -- by source, so this stays a loose pointer rather than tying
  -- priorities to one specific table.
  related_entity_type text,
  related_entity_id uuid,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.priorities enable row level security;

create policy "Members manage priorities"
  on public.priorities for all
  using (is_business_member(business_id))
  with check (is_business_member(business_id));

grant select, insert, update, delete on public.priorities to authenticated;

-- ============================================================
-- Notifications: the shell. Ships mostly empty today - most real
-- sources (automations completing, integration problems) don't
-- exist yet. Built now so it's not deferred forever; new sources
-- just insert into this table later, no schema change needed.
-- ============================================================

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  -- null = business-wide notification, not scoped to one user
  user_id uuid references auth.users(id) on delete cascade,
  type text not null default 'general',
  title text not null,
  body text,
  link text,
  -- Same loose-pointer pattern as priorities.related_entity_* — lets a
  -- future guest request, valet request, or maintenance item generate a
  -- notification without a schema change when that source is built.
  related_entity_type text,
  related_entity_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "Members view business notifications"
  on public.notifications for select
  using (
    is_business_member(business_id)
    and (user_id is null or user_id = auth.uid())
  );

create policy "Members can mark their notifications read"
  on public.notifications for update
  using (is_business_member(business_id) and (user_id is null or user_id = auth.uid()))
  with check (is_business_member(business_id) and (user_id is null or user_id = auth.uid()));

create policy "Members can create notifications"
  on public.notifications for insert
  with check (is_business_member(business_id));

grant select, insert, update on public.notifications to authenticated;
