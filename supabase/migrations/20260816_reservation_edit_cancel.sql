-- Reservation edit and cancel mutations.
--
-- SECURITY INVOKER (the default) is deliberate. Atomicity comes from the
-- function body being a single transaction, not from the security context.
-- Verified 2026-08-16 that role `authenticated` holds the needed table
-- privileges and that reservations, guests, rooms and registration_links
-- all have RLS enabled with member-scoped ALL policies. RLS therefore
-- remains the primary tenant boundary; the explicit is_business_member()
-- checks below are defense in depth so a future policy change cannot
-- silently open these mutations.
--
-- APPLIED: 2026-08-16

alter table reservations
  add column if not exists registration_review_required boolean not null default false;


create or replace function update_reservation(
  p_reservation_id      uuid,
  p_first_name          text,
  p_last_name           text,
  p_email               text,
  p_phone               text,
  p_arrival_date        date,
  p_departure_date      date,
  p_guest_count         integer,
  p_room_id             uuid,
  p_confirmation_number text
)
returns reservations
language plpgsql
security invoker
as $$
declare
  v_res         reservations;
  v_arrival     date;
  v_guest_rows  integer;
  v_first       text := nullif(btrim(p_first_name), '');
  v_last        text := nullif(btrim(p_last_name), '');
  v_email       text := nullif(btrim(p_email), '');
  v_phone       text := nullif(btrim(p_phone), '');
  v_confirm     text := nullif(btrim(p_confirmation_number), '');
begin
  -- Serialize against concurrent edit / cancel / check-in on this row.
  -- Without this, two requests can both read an active reservation, both
  -- pass their state checks, and both proceed on stale assumptions.
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
    raise exception 'Cancelled reservations cannot be edited';
  end if;

  if v_first is null or v_last is null then
    raise exception 'Guest first and last name are required';
  end if;

  -- A reservation must stay reachable for registration.
  if v_email is null and v_phone is null then
    raise exception 'An email or phone number is required';
  end if;

  -- Arrival is a fact once the guest has arrived, not a plan.
  v_arrival := case
    when v_res.checked_in_at is not null then v_res.arrival_date
    else p_arrival_date
  end;

  if v_arrival is null or p_departure_date is null then
    raise exception 'Arrival and departure dates are required';
  end if;

  if p_departure_date <= v_arrival then
    raise exception 'Departure must be after arrival';
  end if;

  if p_guest_count is null or p_guest_count < 1 then
    raise exception 'Guest count must be at least 1';
  end if;

  -- Ownership and active check only. This does NOT check for overlapping
  -- reservations; double-booking prevention is a separate future feature.
  if p_room_id is not null then
    if not exists (
      select 1 from rooms
      where id = p_room_id
        and business_id = v_res.business_id
        and active
    ) then
      raise exception 'Room is inactive or does not belong to this property';
    end if;
  end if;

  update guests set
    first_name = v_first,
    last_name  = v_last,
    email      = v_email,
    phone      = v_phone
  where id = v_res.primary_guest_id
    and business_id = v_res.business_id;

  get diagnostics v_guest_rows = row_count;

  -- Zero rows would leave the edit half-applied while still committing.
  if v_guest_rows <> 1 then
    raise exception 'Primary guest not found for this reservation';
  end if;

  update reservations set
    arrival_date        = v_arrival,
    departure_date      = p_departure_date,
    guest_count         = p_guest_count,
    room_id             = p_room_id,
    confirmation_number = v_confirm,
    -- Material date change after completed registration. Sticky: an
    -- unrelated later edit must not clear a pending review.
    registration_review_required = registration_review_required or (
      registration_status = 'completed'
      and (v_arrival is distinct from arrival_date
        or p_departure_date is distinct from departure_date)
    ),
    updated_at = now()
  where id = p_reservation_id
  returning * into v_res;

  return v_res;
end;
$$;


create or replace function cancel_reservation(p_reservation_id uuid)
returns reservations
language plpgsql
security invoker
as $$
declare
  v_res reservations;
begin
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

  if v_res.checked_in_at is not null then
    raise exception 'Checked-in reservations cannot be cancelled. Check the guest out instead.';
  end if;

  if v_res.reservation_status = 'cancelled' then
    raise exception 'Reservation is already cancelled';
  end if;

  -- Revoke every active link, not just the newest: a reservation may have
  -- several if a link was reissued. Completed registrations and signatures
  -- are preserved as historical records.
  update registration_links
    set revoked_at = now()
  where reservation_id = p_reservation_id
    and revoked_at is null;

  update reservations
    set reservation_status = 'cancelled',
        updated_at = now()
  where id = p_reservation_id
  returning * into v_res;

  return v_res;
end;
$$;


revoke all on function update_reservation(
  uuid, text, text, text, text, date, date, integer, uuid, text
) from public, anon;

revoke all on function cancel_reservation(uuid) from public, anon;

grant execute on function update_reservation(
  uuid, text, text, text, text, date, date, integer, uuid, text
) to authenticated;

grant execute on function cancel_reservation(uuid) to authenticated;