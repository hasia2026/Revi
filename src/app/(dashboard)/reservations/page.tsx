import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import type { ModuleConfig } from "@/lib/cu3/module-framework";
import { CalendarDays } from "lucide-react";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import { getPropertyToday } from "@/lib/time/property-time";
import { createClient } from "@/lib/supabase/server";
import ReservationsWorkspace from "@/components/hospitality/ReservationsWorkspace";

type ReservationRow = {
  id: string;
  confirmation_number?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
  guest_count?: number | null;
  reservation_status?: string | null;
  registration_status?: string | null;
  registration_review_required?: boolean | null;
  registration_links?:
    | {
        id: string;
        expires_at: string | null;
        revoked_at: string | null;
        completed_at: string | null;
        created_at: string | null;
      }[]
    | null;
  room_id?: string | null;
  checked_in_at?: string | null;
  primary_guest_id?: string | null;
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
};

export default async function ReservationsPage() {
  const { businessId, businessName, timezone } = await getModulePageContext();
  const supabase = await createClient();

  const res = await supabase
    .from("reservations")
    .select(
      "id, confirmation_number, arrival_date, departure_date, guest_count, reservation_status, registration_status, registration_review_required, registration_links(id, expires_at, revoked_at, completed_at, created_at), room_id, checked_in_at, primary_guest_id, guests(first_name,last_name,email,phone), rooms(room_number)"
    )
    .eq("business_id", businessId)
    .order("arrival_date", { ascending: true });

  const list: ReservationRow[] = (res.data ?? []) as ReservationRow[];

  const roomsRes = await supabase
    .from("rooms")
    .select("id, room_number")
    .eq("business_id", businessId)
    .eq("active", true)
    .order("room_number", { ascending: true });

  const rooms = (roomsRes.data ?? []) as { id: string; room_number: string }[];

  const today = getPropertyToday(timezone);
  const activeList = list.filter((r) => r.reservation_status !== "cancelled");
  const total = activeList.length;
  const arrivingToday = activeList.filter((r) => String(r.arrival_date || "").slice(0, 10) === today).length;
  const registrationCompleted = activeList.filter((r) => r.registration_status === "completed").length;
  const checkedInCount = activeList.filter((r) => !!r.checked_in_at).length;

  const config: ModuleConfig = {
    key: "reservations",
    title: "Reservations",
    description: "View and manage reservations for this property",
    icon: CalendarDays,
    status: "active",  aiAssistant: { name: "Front Desk", tagline: "Reservation and arrival help" },

    overviewCards: [
      { label: "Total reservations", value: String(total), icon: CalendarDays },
      { label: "Arriving today", value: String(arrivingToday), icon: CalendarDays },
      { label: "Registration completed", value: String(registrationCompleted), icon: CalendarDays },
      { label: "Checked in", value: String(checkedInCount), icon: CalendarDays },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [],
    activity: [],
    businessContext: businessName ?? undefined,
  };

  return (
    <ModuleFramework config={config}>
      <ReservationsWorkspace businessId={businessId} initialReservations={list} rooms={rooms} />
    </ModuleFramework>
  );
}
