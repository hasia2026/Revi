-- Company Compass: the single source of truth other modules (Website Builder,
-- Marketing, Mascot Studio, AI Ambassador) generate content from.
-- One row per business.

create table if not exists public.company_compass (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  vision text,
  mission text,
  constitution text,
  core_values jsonb not null default '[]'::jsonb,
  company_story text,
  customer_promise text,
  employee_promise text,
  leadership_principles jsonb not null default '[]'::jsonb,
  brand_voice text,
  elevator_pitch text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_compass enable row level security;

create policy "Members manage company compass"
  on public.company_compass for all
  using (is_business_member(business_id))
  with check (is_business_member(business_id));

-- Base grants — this project's tables were missing these entirely (see
-- docs/Known-Issues.md, Alpha bug #2). Don't repeat that here.
grant select, insert, update, delete on public.company_compass to authenticated;
