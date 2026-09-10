-- Guest Registration Slice 2: editable guest details + atomic completion.
-- Run this in Supabase SQL Editor before testing the form.

create table if not exists public.guest_registration_submissions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  locale text not null,
  signature_name text not null,
  consented_at timestamptz not null,
  submitted_at timestamptz not null default now(),
  unique (reservation_id)
);

alter table public.guest_registration_submissions enable row level security;

drop policy if exists "Members read guest registration submissions"
on public.guest_registration_submissions;

create policy "Members read guest registration submissions"
on public.guest_registration_submissions
for select
using (public.is_business_member(business_id));

grant select on public.guest_registration_submissions to authenticated;

drop function if exists public.resolve_registration_link(text);

create function public.resolve_registration_link(p_token_hash text)
returns table (
  status           text,
  guest_first_name text,
  guest_last_name  text,
  guest_email      text,
  guest_phone      text,
  guest_address    text,
  property_name    text,
  arrival_date     date,
  departure_date   date,
  expires_at       timestamptz
)
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_link          public.registration_links;
  v_res           public.reservations;
  v_guest         public.guests;
  v_property_name text;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select 'invalid'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select * into v_link
  from public.registration_links
  where token_hash = p_token_hash;

  if not found or v_link.revoked_at is not null then
    return query select 'invalid'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select * into v_res
  from public.reservations
  where id = v_link.reservation_id;

  if not found or v_res.reservation_status = 'cancelled' then
    return query select 'invalid'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  if v_link.expires_at <= now() then
    return query select 'expired'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  if v_link.completed_at is not null then
    return query select 'completed'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select * into v_guest
  from public.guests
  where id = v_res.primary_guest_id
    and business_id = v_res.business_id;

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select b.name into v_property_name
  from public.businesses b
  where b.id = v_res.business_id;

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::text, null::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  update public.registration_links
  set last_used_at = now()
  where id = v_link.id;

  return query select
    'valid'::text,
    v_guest.first_name,
    v_guest.last_name,
    v_guest.email,
    v_guest.phone,
    v_guest.address,
    v_property_name,
    v_res.arrival_date,
    v_res.departure_date,
    v_link.expires_at;
end;
$$;

revoke all on function public.resolve_registration_link(text)
from public, anon, authenticated, service_role;

grant execute on function public.resolve_registration_link(text)
to anon, authenticated;

create or replace function public.submit_guest_registration(
  p_token_hash text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_address text,
  p_locale text,
  p_signature_name text,
  p_consent boolean
)
returns boolean
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_link public.registration_links;
  v_res public.reservations;
  v_guest public.guests;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Registration link is invalid or no longer available';
  end if;

  if coalesce(btrim(p_first_name), '') = '' or coalesce(btrim(p_last_name), '') = '' then
    raise exception 'Guest first and last name are required';
  end if;

  if lower(coalesce(p_locale, '')) not in ('en', 'es', 'ar', 'vi') then
    raise exception 'Unsupported registration locale';
  end if;

  if p_consent is not true or coalesce(btrim(p_signature_name), '') = '' then
    raise exception 'Consent and signature are required';
  end if;

  select * into v_link
  from public.registration_links
  where token_hash = p_token_hash
  for update;

  if not found or v_link.revoked_at is not null then
    raise exception 'Registration link is invalid or no longer available';
  end if;

  if v_link.expires_at <= now() then
    raise exception 'Registration link has expired';
  end if;

  if v_link.completed_at is not null then
    raise exception 'Registration has already been completed';
  end if;

  select * into v_res
  from public.reservations
  where id = v_link.reservation_id
  for update;

  if not found or v_res.reservation_status = 'cancelled' then
    raise exception 'Registration link is invalid or no longer available';
  end if;

  select * into v_guest
  from public.guests
  where id = v_res.primary_guest_id
    and business_id = v_res.business_id
  for update;

  if not found then
    raise exception 'Guest record could not be found';
  end if;

  update public.guests
  set
    first_name = btrim(p_first_name),
    last_name = btrim(p_last_name),
    email = nullif(btrim(p_email), ''),
    phone = nullif(btrim(p_phone), ''),
    address = nullif(btrim(p_address), ''),
    updated_at = now()
  where id = v_guest.id;

  insert into public.guest_registration_submissions (
    business_id,
    reservation_id,
    guest_id,
    locale,
    signature_name,
    consented_at,
    submitted_at
  )
  values (
    v_res.business_id,
    v_res.id,
    v_guest.id,
    lower(p_locale),
    btrim(p_signature_name),
    now(),
    now()
  );

  update public.reservations
  set
    registration_status = 'completed',
    registration_review_required = false,
    updated_at = now()
  where id = v_res.id;

  update public.registration_links
  set completed_at = now(), last_used_at = now()
  where id = v_link.id;

  return true;
end;
$$;

revoke all on function public.submit_guest_registration(text, text, text, text, text, text, text, text, boolean)
from public, anon, authenticated, service_role;

grant execute on function public.submit_guest_registration(text, text, text, text, text, text, text, text, boolean)
to anon, authenticated;
