-- Registration link creation and anonymous resolution.
--
-- The raw token is generated in application code (crypto.randomBytes),
-- SHA-256 hashed there, and only the hash reaches the database. The raw
-- bearer credential is never stored, logged, or recoverable.
--
-- create_registration_link is SECURITY INVOKER: verified 2026-08-20 that
-- `authenticated` holds INSERT on registration_links and that the
-- member-scoped ALL policy carries an is_business_member(business_id)
-- WITH CHECK.
--
-- resolve_registration_link is SECURITY DEFINER by necessity — the guest is
-- anonymous, and `anon` has no SELECT on registration_links or reservations
-- (verified 2026-08-20). This function is the only intended anonymous path
-- into registration state, so it returns the minimum necessary and never
-- guest PII.
--
-- APPLIED: 2026-08-20

create or replace function create_registration_link(
  p_reservation_id uuid,
  p_token_hash     text
)
returns registration_links
language plpgsql
security invoker
as $$
declare
  v_res         reservations;
  v_timezone    text;
  v_expiry_date date;
  v_expires_at  timestamptz;
  v_link        registration_links;
begin
  -- Serialize against cancel, edit, and concurrent reissue.
  select * into v_res
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    raise exception 'Reservation not found';
  end if;

  if not is_business_member(v_res.business_id) then
    raise exception 'Not authorized';
  end if;

  if v_res.reservation_status = 'cancelled' then
    raise exception 'Cannot create a registration link for a cancelled reservation';
  end if;

  if v_res.checked_in_at is not null then
    raise exception 'Guest is already checked in';
  end if;

  -- SHA-256 hex, lowercase. Anything else did not come from our generator.
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'Invalid token hash';
  end if;

  select timezone into v_timezone
  from businesses
  where id = v_res.business_id;

  -- Expiry is policy, computed here, never accepted as a parameter —
  -- otherwise any member could mint a long-lived credential.
  --
  -- Earlier of departure or arrival + 1 day, expiring at the end of that
  -- property-local calendar day. A 90-night stay must not produce a
  -- 90-day bearer credential. End of day is the start of the next day,
  -- never +24h, so DST is handled by AT TIME ZONE.
  v_expiry_date := least(v_res.departure_date, v_res.arrival_date + 1);
  v_expires_at  := (v_expiry_date + 1)::timestamp at time zone v_timezone;

  if v_expires_at <= now() then
    raise exception 'This reservation has already ended';
  end if;

  -- At most one usable credential per reservation. Completed links are
  -- historical records and are left untouched.
  update registration_links
    set revoked_at = now()
  where reservation_id = p_reservation_id
    and revoked_at is null
    and completed_at is null;

  insert into registration_links (business_id, reservation_id, token_hash, expires_at)
  values (v_res.business_id, p_reservation_id, p_token_hash, v_expires_at)
  returning * into v_link;

  return v_link;
end;
$$;

create or replace function resolve_registration_link(p_token_hash text)
returns table (
  status         text,
  reservation_id uuid,
  business_id    uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link public.registration_links;
  v_res  public.reservations;
begin
  select * into v_link
  from public.registration_links
  where token_hash = p_token_hash;

  -- Unknown and revoked are deliberately indistinguishable: a caller must
  -- not learn that a token was ever valid.
  if not found or v_link.revoked_at is not null then
    return query select 'invalid'::text, null::uuid, null::uuid;
    return;
  end if;

  select * into v_res
  from public.reservations
  where id = v_link.reservation_id;

  if not found or v_res.reservation_status = 'cancelled' then
    return query select 'invalid'::text, null::uuid, null::uuid;
    return;
  end if;

  if v_link.expires_at <= now() then
    return query select 'expired'::text, null::uuid, null::uuid;
    return;
  end if;

  if v_link.completed_at is not null then
    return query select 'completed'::text, null::uuid, null::uuid;
    return;
  end if;

  update public.registration_links
    set last_used_at = now()
  where id = v_link.id;

  return query select 'valid'::text, v_link.reservation_id, v_link.business_id;
end;
$$;

-- Postgres grants EXECUTE to PUBLIC by default on new functions, and `anon`
-- inherits that. Revoking from `anon` alone leaves the PUBLIC grant in place —
-- revoke from PUBLIC first. Verified 2026-08-20 that anon cannot execute
-- create_registration_link.
revoke execute on function create_registration_link(uuid, text) from public;
revoke execute on function create_registration_link(uuid, text) from anon;
grant execute on function create_registration_link(uuid, text) to authenticated;

revoke execute on function public.resolve_registration_link(text) from public;
grant execute on function public.resolve_registration_link(text) to anon, authenticated;
