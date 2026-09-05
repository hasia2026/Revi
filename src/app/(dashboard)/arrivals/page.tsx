import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import ArrivalsWorkspace from "@/components/hospitality/ArrivalsWorkspace";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import type { ModuleConfig } from "@/lib/cu3/module-framework";
import { createClient } from "@/lib/supabase/server";
import { getPropertyToday } from "@/lib/time/property-time";
import { PlaneLanding } from "lucide-react";

type ReservationRow = {
  id: string;
  confirmation_number?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
  guest_count?: number | null;
  reservation_status?: string | null;
  registration_status?: string | null;
  registration_review_required?: boolean | null;
  checked_in_at?: string | null;
  room_id?: string | null;
  guests?:
    | {
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
        phone?: string | null;
      }
    | Array<{
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
        phone?: string | null;
      }>
    | null;
  rooms?: { room_number?: string | null } | null;
  registration_links?:
    | {
        id: string;
        expires_at: string | null;
        revoked_at: string | null;
        completed_at: string | null;
        created_at: string | null;
      }[]
    | null;
};

function hasValidActiveLink(links: ReservationRow["registration_links"]): boolean {
  if (!links || links.length === 0) return false;

  const newest = [...links].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  )[0];

  if (!newest) return false;
  if (newest.revoked_at || newest.completed_at) return false;
  if (!newest.expires_at) return false;

  return new Date(newest.expires_at).getTime() > Date.now();
}

export default async function ArrivalsPage() {
  const { businessId, businessName, timezone } = await getModulePageContext();
  const supabase = await createClient();
  const today = getPropertyToday(timezone);

  const { data } = await supabase
    .from("reservations")
    .select(
      "id, confirmation_number, arrival_date, departure_date, guest_count, reservation_status, registration_status, registration_review_required, checked_in_at, room_id, guests(first_name,last_name,email,phone), rooms(room_number), registration_links(id, expires_at, revoked_at, completed_at, created_at)"
    )
    .eq("business_id", businessId)
    .eq("arrival_date", today)
    .neq("reservation_status", "cancelled")
    .order("arrival_date", { ascending: true });

  const { data: roomsData } = await supabase
    .from("rooms")
    .select("id, room_number")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("room_number", { ascending: true });

  const reservations = (data ?? []) as ReservationRow[];
  const rooms = (roomsData ?? []) as { id: string; room_number: string }[];

  const arrivingToday = reservations.length;
  const registrationNeeded = reservations.filter(
    (reservation) =>
      !reservation.checked_in_at &&
      reservation.registration_status !== "completed" &&
      !hasValidActiveLink(reservation.registration_links),
  ).length;
  const readyForCheckIn = reservations.filter(
    (reservation) =>
      reservation.registration_status === "completed" &&
      reservation.registration_review_required !== true &&
      !reservation.checked_in_at,
  ).length;
  const checkedIn = reservations.filter((reservation) => !!reservation.checked_in_at).length;

  const config: ModuleConfig = {
    key: "arrivals",
    title: "Arrivals",
    description: "Today's arriving guests and check-in readiness",
    icon: PlaneLanding,
    status: "active",
    aiAssistant: {
      name: "Front Desk",
      tagline: "Guest arrival readiness",
    },
    overviewCards: [
      { label: "Arriving today", value: String(arrivingToday), icon: PlaneLanding },
      { label: "Registration needed", value: String(registrationNeeded), icon: PlaneLanding },
      { label: "Ready for check-in", value: String(readyForCheckIn), icon: PlaneLanding },
      { label: "Checked in", value: String(checkedIn), icon: PlaneLanding },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [{ label: "Reservations", href: "/reservations", relation: "upstream" }],
    activity: [],
    businessContext: businessName ?? undefined,
  };

  return (
    <ModuleFramework config={config}>
      <ArrivalsWorkspace initialReservations={reservations} rooms={rooms} today={today} />
    </ModuleFramework>
  );
}
