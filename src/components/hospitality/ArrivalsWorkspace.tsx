"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { createRegistrationLink } from "@/lib/registration/actions";
import { formatPropertyDate } from "@/lib/time/property-time";
import { AlertCircle, CalendarDays, CheckCircle2, ClipboardCheck, PlaneLanding, UserCheck } from "lucide-react";
import { toast } from "sonner";

type GuestRecord = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type LinkRecord = {
  id: string;
  expires_at: string | null;
  revoked_at: string | null;
  completed_at: string | null;
  created_at: string | null;
};

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
  guests?: GuestRecord | GuestRecord[] | null;
  rooms?: { room_number?: string | null } | null;
  registration_links?: LinkRecord[] | null;
};

function getNewestLink(links?: LinkRecord[] | null) {
  if (!links || links.length === 0) return null;
  return [...links].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  )[0] ?? null;
}

function getGuestName(guests?: ReservationRow["guests"]) {
  const list = Array.isArray(guests) ? guests : guests ? [guests] : [];
  const guest = list.find((candidate) => {
    const firstName = candidate?.first_name?.trim();
    const lastName = candidate?.last_name?.trim();
    return Boolean(firstName || lastName);
  });

  if (!guest) return "Guest";

  const firstName = guest.first_name?.trim() ?? "";
  const lastName = guest.last_name?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  return fullName || "Guest";
}

function getRoomNumber(reservation: ReservationRow) {
  if (reservation.rooms && typeof reservation.rooms === "object" && reservation.rooms.room_number) {
    return reservation.rooms.room_number;
  }
  return reservation.room_id ? "Assigned" : "Unassigned";
}

function getRegistrationState(reservation: ReservationRow) {
  if (reservation.registration_review_required) {
    return { label: "Review required", variant: "warning" as const, key: "review_required" };
  }

  if (reservation.registration_status === "completed") {
    return { label: "Complete", variant: "success" as const, key: "complete" };
  }

  const newest = getNewestLink(reservation.registration_links);

  if (
    newest &&
    !newest.revoked_at &&
    !newest.completed_at &&
    newest.expires_at &&
    new Date(newest.expires_at).getTime() > Date.now()
  ) {
    return { label: "Sent", variant: "info" as const, key: "sent" };
  }

  if (
    newest &&
    !newest.completed_at &&
    newest.expires_at &&
    new Date(newest.expires_at).getTime() <= Date.now()
  ) {
    return { label: "Expired", variant: "warning" as const, key: "expired" };
  }

  return { label: "Needed", variant: "default" as const, key: "needed" };
}

function getArrivalState(reservation: ReservationRow) {
  if (reservation.checked_in_at) {
    return { label: "Checked in", variant: "success" as const };
  }

  if (reservation.registration_status === "completed" && !reservation.registration_review_required) {
    return { label: "Ready for check-in", variant: "info" as const };
  }

  return { label: "Expected", variant: "default" as const };
}

function getNextAction(reservation: ReservationRow) {
  if (reservation.checked_in_at) return "Checked in";
  if (reservation.registration_review_required) return "Review registration";
  if (reservation.registration_status === "completed" && !reservation.registration_review_required) {
    return "Ready for check-in";
  }

  const newest = getNewestLink(reservation.registration_links);
  if (
    newest &&
    !newest.revoked_at &&
    !newest.completed_at &&
    newest.expires_at &&
    new Date(newest.expires_at).getTime() > Date.now()
  ) {
    return "Awaiting guest";
  }

  if (
    newest &&
    !newest.completed_at &&
    newest.expires_at &&
    new Date(newest.expires_at).getTime() <= Date.now()
  ) {
    return "Reissue registration";
  }

  if (!newest) return "Send registration";
  return "Send registration";
}

function shouldShowRegistrationLinkButton(reservation: ReservationRow) {
  if (reservation.checked_in_at) return false;
  if (reservation.registration_review_required) return false;
  if (reservation.registration_status === "completed" && !reservation.registration_review_required) return false;

  return true;
}

function canCheckIn(reservation: ReservationRow) {
  if (!reservation || reservation.checked_in_at) return false;
  if (reservation.reservation_status === "cancelled") return false;
  if (reservation.registration_review_required) return false;
  if (reservation.registration_status !== "completed") return false;

  return true;
}

function formatDate(date: string | null | undefined) {
  return date ? formatPropertyDate(date) : "—";
}

export default function ArrivalsWorkspace({
  initialReservations,
  rooms,
  today,
}: {
  initialReservations: ReservationRow[];
  rooms: { id: string; room_number: string }[];
  today: string;
}) {
  const router = useRouter();
  const [generatedLinks, setGeneratedLinks] = useState<Record<string, string>>({});
  const [creatingIds, setCreatingIds] = useState<Record<string, boolean>>({});
  const [copiedIds, setCopiedIds] = useState<Record<string, boolean>>({});
  const [checkInReservation, setCheckInReservation] = useState<ReservationRow | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [checkingIn, setCheckingIn] = useState(false);

  const reservations = useMemo(() => initialReservations ?? [], [initialReservations]);

  async function handleCreateLink(reservationId: string) {
    setCreatingIds((prev) => ({ ...prev, [reservationId]: true }));

    const result = await createRegistrationLink(reservationId);

    setCreatingIds((prev) => ({ ...prev, [reservationId]: false }));

    if (!result.ok) {
      toast.error(result.error);
      return;
    }

    setGeneratedLinks((prev) => ({ ...prev, [reservationId]: result.url }));
    toast.success("Registration link generated");
    router.refresh();
  }

  async function handleCopyLink(reservationId: string) {
    const url = generatedLinks[reservationId];
    if (!url) return;

    await navigator.clipboard.writeText(url);
    setCopiedIds((prev) => ({ ...prev, [reservationId]: true }));
    setTimeout(() => {
      setCopiedIds((prev) => ({ ...prev, [reservationId]: false }));
    }, 2000);
  }

  function openCheckInModal(reservation: ReservationRow) {
    if (!canCheckIn(reservation)) return;
    setCheckInReservation(reservation);
    setSelectedRoomId(reservation.room_id ?? "");
  }

  async function handleCheckIn() {
    if (!checkInReservation) return;

    setCheckingIn(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const roomId = selectedRoomId || checkInReservation.room_id || null;

      const { error } = await supabase.rpc("check_in_reservation", {
        p_reservation_id: checkInReservation.id,
        p_room_id: roomId || null,
      });

      if (error) {
        const known = new Map([
          ["Reservation not found", "Reservation not found"],
          ["Not authorized", "Not authorized"],
          ["Cancelled reservation cannot be checked in", "Cancelled reservation cannot be checked in"],
          ["Reservation is already checked in", "Reservation is already checked in"],
          ["Registration must be completed before check-in", "Registration must be completed before check-in"],
          ["Registration review is required before check-in", "Registration review is required before check-in"],
          ["Reservation cannot be checked in before the arrival date", "Reservation cannot be checked in before the arrival date"],
          ["Room is inactive or does not belong to this property", "Room is inactive or does not belong to this property"],
        ]);

        const message = known.get(error.message) || `Could not check in guest: ${error.message}`;
        toast.error(message);
        return;
      }

      toast.success("Guest checked in");
      setCheckInReservation(null);
      setSelectedRoomId("");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "Could not check in guest.");
    } finally {
      setCheckingIn(false);
    }
  }

  if (reservations.length === 0) {
    return (
      <div className="rounded-2xl border border-charcoal-200 bg-white p-4">
        <EmptyState
          icon={PlaneLanding}
          title="No arrivals scheduled for today."
          description={`Showing ${formatDate(today)} in the property's local time.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden md:block overflow-hidden rounded-2xl border border-charcoal-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-charcoal-50 text-charcoal-700">
              <tr>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Room</th>
                <th className="px-4 py-3 font-medium">Confirmation #</th>
                <th className="px-4 py-3 font-medium">Stay dates</th>
                <th className="px-4 py-3 font-medium">Registration</th>
                <th className="px-4 py-3 font-medium">Arrival status</th>
                <th className="px-4 py-3 font-medium">Next action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-200">
              {reservations.map((reservation) => {
                const registrationState = getRegistrationState(reservation);
                const arrivalState = getArrivalState(reservation);
                const nextAction = getNextAction(reservation);
                const guestName = getGuestName(reservation.guests);
                const generatedUrl = generatedLinks[reservation.id];
                const reviewRequired = reservation.registration_review_required;

                return (
                  <tr
                    key={reservation.id}
                    className={reviewRequired ? "bg-amber-50/60" : "bg-white"}
                  >
                    <td className="px-4 py-3 align-top">
                      <div className="font-medium text-charcoal-900">{guestName}</div>
                      <div className="mt-1 text-xs text-charcoal-500">
                        {reservation.guest_count ?? 1} guest{(reservation.guest_count ?? 1) > 1 ? "s" : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">{getRoomNumber(reservation)}</td>
                    <td className="px-4 py-3 align-top">{reservation.confirmation_number ?? "—"}</td>
                    <td className="px-4 py-3 align-top">
                      <div>{formatDate(reservation.arrival_date)}</div>
                      <div className="text-xs text-charcoal-500">to {formatDate(reservation.departure_date)}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={registrationState.variant}>
                        {registrationState.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Badge variant={arrivalState.variant}>{arrivalState.label}</Badge>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="space-y-2">
                        <div className="font-medium text-charcoal-800">{nextAction}</div>
                        {canCheckIn(reservation) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() => openCheckInModal(reservation)}
                          >
                            Check in
                          </Button>
                        ) : generatedUrl ? (
                          <div className="space-y-2">
                            <input
                              readOnly
                              value={generatedUrl}
                              onFocus={(event) => event.target.select()}
                              className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-mono text-emerald-800"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleCopyLink(reservation.id)}
                            >
                              {copiedIds[reservation.id] ? "Copied" : "Copy link"}
                            </Button>
                          </div>
                        ) : shouldShowRegistrationLinkButton(reservation) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant={reviewRequired ? "primary" : "secondary"}
                            loading={creatingIds[reservation.id]}
                            onClick={() => handleCreateLink(reservation.id)}
                          >
                            {nextAction === "Awaiting guest"
                              ? "Reissue link"
                              : nextAction === "Reissue registration"
                                ? "Reissue registration"
                                : "Send registration"}
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {reservations.map((reservation) => {
          const registrationState = getRegistrationState(reservation);
          const arrivalState = getArrivalState(reservation);
          const nextAction = getNextAction(reservation);
          const guestName = getGuestName(reservation.guests);
          const generatedUrl = generatedLinks[reservation.id];
          const reviewRequired = reservation.registration_review_required;

          return (
            <div
              key={reservation.id}
              className={reviewRequired ? "rounded-2xl border border-amber-200 bg-amber-50/70 p-4" : "rounded-2xl border border-charcoal-200 bg-white p-4"}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-charcoal-900">{guestName}</div>
                  <div className="mt-1 text-xs text-charcoal-500">{reservation.confirmation_number ?? "No confirmation"}</div>
                </div>
                <Badge variant={arrivalState.variant}>{arrivalState.label}</Badge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-charcoal-600">
                <div className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(reservation.arrival_date)} → {formatDate(reservation.departure_date)}</div>
                <div className="flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> {getRoomNumber(reservation)}</div>
              </div>

              <div className="mt-3">
                <Badge variant={registrationState.variant}>{registrationState.label}</Badge>
              </div>

              <div className="mt-4">
                <div className="text-xs font-medium uppercase tracking-wide text-charcoal-500">Next action</div>
                <div className="mt-1 text-sm font-medium text-charcoal-800">{nextAction}</div>
              </div>

              {canCheckIn(reservation) ? (
                <div className="mt-3">
                  <Button type="button" size="sm" onClick={() => openCheckInModal(reservation)} className="w-full">
                    Check in
                  </Button>
                </div>
              ) : generatedUrl ? (
                <div className="mt-3 space-y-2">
                  <input
                    readOnly
                    value={generatedUrl}
                    onFocus={(event) => event.target.select()}
                    className="w-full rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-[11px] font-mono text-emerald-800"
                  />
                  <Button type="button" size="sm" variant="secondary" onClick={() => handleCopyLink(reservation.id)}>
                    {copiedIds[reservation.id] ? "Copied" : "Copy link"}
                  </Button>
                </div>
              ) : shouldShowRegistrationLinkButton(reservation) ? (
                <div className="mt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant={reviewRequired ? "primary" : "secondary"}
                    loading={creatingIds[reservation.id]}
                    onClick={() => handleCreateLink(reservation.id)}
                    className="w-full"
                  >
                    {nextAction === "Awaiting guest"
                      ? "Reissue link"
                      : nextAction === "Reissue registration"
                        ? "Reissue registration"
                        : "Send registration"}
                  </Button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <Modal
        open={!!checkInReservation}
        onClose={() => { setCheckInReservation(null); setSelectedRoomId(""); }}
        title="Complete check-in"
        size="lg"
      >
        {checkInReservation && (
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="text-sm text-charcoal-600">Guest</div>
              <div className="text-lg font-semibold text-charcoal-900">{getGuestName(checkInReservation.guests)}</div>
              <div className="text-sm text-charcoal-600">
                {formatDate(checkInReservation.arrival_date)} → {formatDate(checkInReservation.departure_date)}
              </div>
            </div>

            <div className="rounded-xl border border-charcoal-200 bg-charcoal-50 p-3 text-sm text-charcoal-700">
              <div className="flex items-center justify-between gap-3">
                <span>Registration</span>
                <Badge variant="success">Complete</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-charcoal-700">Assigned room</label>
              {checkInReservation.room_id ? (
                <div className="rounded-lg border border-charcoal-200 bg-charcoal-50 px-3 py-2 text-sm text-charcoal-800">
                  {getRoomNumber(checkInReservation)}
                </div>
              ) : (
                <select
                  value={selectedRoomId}
                  onChange={(event) => setSelectedRoomId(event.target.value)}
                  className="w-full rounded-lg border border-charcoal-200 bg-white px-3 py-2 text-sm text-charcoal-800 focus:border-charcoal-400 focus:outline-none"
                >
                  <option value="">Select an active room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.room_number}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-charcoal-100">
              <Button type="button" variant="secondary" onClick={() => { setCheckInReservation(null); setSelectedRoomId(""); }}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCheckIn}
                loading={checkingIn}
                disabled={Boolean(!checkInReservation.room_id && !selectedRoomId)}
              >
                Complete check-in
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
