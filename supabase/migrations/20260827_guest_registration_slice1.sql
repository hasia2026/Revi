-- Record the already-applied Slice 1 guest registration state.

create or replace function public.create_registration_link(
  p_reservation_id uuid,
  p_token_hash     text
)
returns public.registration_links
language plpgsql
security invoker
set search_path to ''
as $$
declare
  v_res         public.reservations;
  v_timezone    text;
  v_expiry_date date;
  v_expires_at  timestamptz;
  v_link        public.registration_links;
begin
  select * into v_res
  from public.reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if not public.is_business_member(v_res.business_id) then
    raise exception 'Not authorized';
  end if;

  if v_res.reservation_status = 'cancelled' then
    raise exception 'Cannot create a registration link for a cancelled reservation';
  end if;

  if v_res.checked_in_at is not null then
    raise exception 'Guest is already checked in';
  end if;

  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid token hash';
  end if;

  select b.timezone
    into v_timezone
  from public.businesses b
  where b.id = v_res.business_id;

  if not found or v_timezone is null then
    raise exception 'Property timezone is not configured';
  end if;

  v_expiry_date := least(v_res.departure_date, v_res.arrival_date + 1);
  v_expires_at  := (v_expiry_date + 1)::timestamp at time zone v_timezone;

  if v_expires_at <= now() then
    raise exception 'This reservation has already ended';
  end if;

  update public.registration_links
    set revoked_at = now()
  where reservation_id = p_reservation_id
    and revoked_at is null
    and completed_at is null;

  insert into public.registration_links (business_id, reservation_id, token_hash, expires_at)
  values (v_res.business_id, p_reservation_id, p_token_hash, v_expires_at)
  returning * into v_link;

  return v_link;
end;
$$;

revoke execute on function public.create_registration_link(uuid, text) from public;
revoke execute on function public.create_registration_link(uuid, text) from anon;
grant execute on function public.create_registration_link(uuid, text) to authenticated;

drop function if exists public.resolve_registration_link(text);

create function public.resolve_registration_link(p_token_hash text)
returns table (
  status           text,
  guest_first_name text,
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
  v_link         public.registration_links;
  v_res          public.reservations;
  v_guest        public.guests;
  v_property_name text;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select 'invalid'::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select * into v_link
  from public.registration_links
  where token_hash = p_token_hash;

  if not found or v_link.revoked_at is not null then
    return query select 'invalid'::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select * into v_res
  from public.reservations
  where id = v_link.reservation_id;

  if not found or v_res.reservation_status = 'cancelled' then
    return query select 'invalid'::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  if v_link.expires_at <= now() then
    return query
      select
        'expired'::text,
        null::text,
        null::text,
        null::date,
        null::date,
        null::timestamptz;
    return;
  end if;

  if v_link.completed_at is not null then
    return query
      select
        'completed'::text,
        null::text,
        null::text,
        null::date,
        null::date,
        null::timestamptz;
    return;
  end if;

  select * into v_guest
  from public.guests
  where id = v_res.primary_guest_id
    and business_id = v_res.business_id;

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  select name into v_property_name
  from public.businesses
  where id = v_res.business_id;

  if not found then
    return query select 'invalid'::text, null::text, null::text, null::date, null::date, null::timestamptz;
    return;
  end if;

  update public.registration_links
    set last_used_at = now()
  where id = v_link.id;

  return query select
    'valid'::text,
    v_guest.first_name,
    v_property_name,
    v_res.arrival_date,
    v_res.departure_date,
    v_link.expires_at;
end;
$$;

revoke all
on function public.resolve_registration_link(text)
from public, anon, authenticated, service_role;

grant execute
on function public.resolve_registration_link(text)
to anon, authenticated;