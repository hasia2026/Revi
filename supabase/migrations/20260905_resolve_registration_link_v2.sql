-- Public registration resolution returns only the fields needed to render the page.

drop function if exists public.resolve_registration_link(text);

create function public.resolve_registration_link(p_token_hash text)
returns table (
  status             text,
  guest_first_name   text,
  guest_last_initial text,
  property_name      text,
  arrival_date       date,
  departure_date     date,
  expires_at         timestamptz,
  preferred_language text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link  public.registration_links;
  v_res   public.reservations;
  v_guest public.guests;
begin
  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    status := 'invalid';
    return next;
    return;
  end if;

  select * into v_link
  from public.registration_links
  where token_hash = p_token_hash;

  if not found or v_link.revoked_at is not null then
    status := 'invalid';
    return next;
    return;
  end if;

  select * into v_res
  from public.reservations
  where id = v_link.reservation_id;

  if not found or v_res.reservation_status = 'cancelled' then
    status := 'invalid';
    return next;
    return;
  end if;

  if v_link.expires_at <= now() then
    status := 'expired';
    return next;
    return;
  end if;

  if v_link.completed_at is not null then
    status := 'completed';
    return next;
    return;
  end if;

  if v_res.primary_guest_id is not null then
    select * into v_guest
    from public.guests
    where id = v_res.primary_guest_id;
  end if;

  update public.registration_links
    set last_used_at = now()
  where id = v_link.id;

  status := 'valid';
  guest_first_name := nullif(trim(coalesce(v_guest.first_name, '')), '');
  guest_last_initial := upper(left(nullif(trim(coalesce(v_guest.last_name, '')), ''), 1));

  select b.name into property_name
  from public.businesses b
  where b.id = v_res.business_id;

  arrival_date := v_res.arrival_date;
  departure_date := v_res.departure_date;
  expires_at := v_link.expires_at;
  preferred_language := coalesce(
    nullif(trim(coalesce(v_res.preferred_language_override, '')), ''),
    nullif(trim(coalesce(v_guest.preferred_language, '')), '')
  );

  return next;
end;
$$;

revoke execute on function public.resolve_registration_link(text) from public;
grant execute on function public.resolve_registration_link(text) to anon, authenticated;