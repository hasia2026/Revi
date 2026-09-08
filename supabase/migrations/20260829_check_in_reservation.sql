-- Secure front-desk check-in.
--
-- Rules:
-- - only members of the reservation's business may check in a guest
-- - reservations must be fully completed and not under review
-- - no double check-in
-- - same property-local arrival-date gate used elsewhere in the app
-- - no room occupancy semantics are introduced here
--
-- CREATED: 2026-08-29

create or replace function public.check_in_reservation(
  p_reservation_id uuid,
  p_room_id        uuid default null
)
returns boolean
language plpgsql
security invoker
set search_path to ''
as $$
declare
  v_res                 public.reservations;
  v_room                public.rooms;
  v_business_tz         text;
  v_property_today      date;
  v_effective_room_id   uuid;
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
    raise exception 'Cancelled reservation cannot be checked in';
  end if;

  if v_res.checked_in_at is not null then
    raise exception 'Reservation is already checked in';
  end if;

  if v_res.registration_status <> 'completed' then
    raise exception 'Registration must be completed before check-in';
  end if;

  if v_res.registration_review_required = true then
    raise exception 'Registration review is required before check-in';
  end if;

  select b.timezone
    into v_business_tz
  from public.businesses b
  where b.id = v_res.business_id;

  if not found or v_business_tz is null or btrim(v_business_tz) = '' then
    raise exception 'Property timezone is not configured';
  end if;

  v_property_today := (now() at time zone v_business_tz)::date;

  if v_res.arrival_date > v_property_today then
    raise exception 'Reservation cannot be checked in before the arrival date';
  end if;

  v_effective_room_id := coalesce(p_room_id, v_res.room_id);

  if v_effective_room_id is not null then
    select * into v_room
    from public.rooms
    where id = v_effective_room_id
      and business_id = v_res.business_id
      and active = true
    for update;

    if not found then
      raise exception 'Room is inactive or does not belong to this property';
    end if;
  end if;

  update public.reservations
  set
    room_id = v_effective_room_id,
    checked_in_at = now(),
    updated_at = now()
  where id = v_res.id;

  return true;
end;
$$;

revoke execute on function public.check_in_reservation(uuid, uuid) from public;
revoke execute on function public.check_in_reservation(uuid, uuid) from anon;
grant execute on function public.check_in_reservation(uuid, uuid) to authenticated;
