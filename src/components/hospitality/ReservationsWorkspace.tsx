"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { createRegistrationLink } from "@/lib/registration/actions";

type GuestRecord = {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
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
  guests?: GuestRecord | GuestRecord[] | null;
  rooms?: { room_number?: string | null } | null;
};

type LinkRecord = {
  id: string;
  expires_at: string | null;
  revoked_at: string | null;
  completed_at: string | null;
  created_at: string | null;
};

type LinkState =
  | { kind: "none" }
  | { kind: "active"; expiresAt: string }
  | { kind: "expired" }
  | { kind: "completed" };

/**
 * A reservation accumulates a link row per reissue. Only the newest one
 * matters — every earlier one was revoked when its replacement was created.
 */
function getLinkState(links: LinkRecord[] | null | undefined): LinkState {
  if (!links || links.length === 0) return { kind: "none" };

  const newest = [...links].sort((a, b) =>
    String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
  )[0];

  if (newest.completed_at) return { kind: "completed" };
  if (newest.revoked_at) return { kind: "none" };
  if (!newest.expires_at) return { kind: "none" };
  if (new Date(newest.expires_at) <= new Date()) return { kind: "expired" };

  return { kind: "active", expiresAt: newest.expires_at };
}

/**
 * RPC errors are raw Postgres exceptions. Known ones are front-desk
 * actionable and shown as-is; anything unrecognized is surfaced verbatim
 * with a prefix so a real bug is visible rather than swallowed.
 */
const KNOWN_RPC_ERRORS = new Set([
  "Departure must be after arrival",
  "Guest count must be at least 1",
  "Guest first and last name are required",
  "An email or phone number is required",
  "Arrival and departure dates are required",
  "Room is inactive or does not belong to this property",
  "Cancelled reservations cannot be edited",
  "Checked-in reservations cannot be cancelled. Check the guest out instead.",
  "Reservation is already cancelled",
  "Reservation not found",
  "Not authorized",
]);

function friendlyRpcError(message: string | undefined): string {
  if (!message) return "Something went wrong. Please try again.";
  if (KNOWN_RPC_ERRORS.has(message)) return message;
  return `Could not save: ${message}`;
}

type EditMode = "editable" | "checked_in" | "read_only";

function getEditMode(r: ReservationRow): EditMode {
  if (r.reservation_status === "cancelled") return "read_only";
  if (r.checked_in_at) return "checked_in";
  return "editable";
}

export default function ReservationsWorkspace({
  businessId,
  initialReservations,
  rooms,
}: {
  businessId: string;
  initialReservations: ReservationRow[];
  rooms: { id: string; room_number: string }[];
}) {
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationRow[]>(initialReservations ?? []);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [roomId, setRoomId] = useState<string>("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<ReservationRow | null>(null);
  const [modalFace, setModalFace] = useState<"edit" | "confirm_cancel">("edit");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [creatingLink, setCreatingLink] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    arrivalDate: "", departureDate: "", guestCount: 1,
    roomId: "", confirmationNumber: "",
  });
  // Loaded values, kept so the review warning compares against what the
  // guest actually registered under rather than the last keystroke.
  const [originalDates, setOriginalDates] = useState({ arrival: "", departure: "" });

  const linkState = editing ? getLinkState(editing.registration_links) : { kind: "none" as const };

  const handleCreateLink = async () => {
    if (!editing) return;
    setCreatingLink(true);
    setModalError(null);

    const result = await createRegistrationLink(editing.id);

    setCreatingLink(false);
    if (!result.ok) {
      setModalError(result.error);
      return;
    }

    // The only time this URL exists. It is not stored and cannot be
    // retrieved again — reissuing is the only way to get another.
    setLinkUrl(result.url);
    router.refresh();
  };

  const handleCopy = async () => {
    if (!linkUrl) return;
    await navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEdit = (r: ReservationRow) => {
    const guestList = Array.isArray(r.guests) ? r.guests : r.guests ? [r.guests] : [];
    const g = guestList[0] ?? {};
    const arrival = r.arrival_date ? String(r.arrival_date).slice(0, 10) : "";
    const departure = r.departure_date ? String(r.departure_date).slice(0, 10) : "";

    setEditForm({
      firstName: g.first_name ?? "",
      lastName: g.last_name ?? "",
      email: g.email ?? "",
      phone: g.phone ?? "",
      arrivalDate: arrival,
      departureDate: departure,
      guestCount: r.guest_count ?? 1,
      roomId: r.room_id ?? "",
      confirmationNumber: r.confirmation_number ?? "",
    });
    setOriginalDates({ arrival, departure });
    setModalFace("edit");
    setModalError(null);
    setLinkUrl(null);
    setCopied(false);
    setEditing(r);
  };

  const closeModal = () => {
    // Never close mid-transaction; the outcome must stay visible.
    if (submitting) return;
    setEditing(null);
    setModalError(null);
    setLinkUrl(null);
    setCopied(false);
  };

  const mode = editing ? getEditMode(editing) : "editable";

  const datesChanged =
    editForm.arrivalDate !== originalDates.arrival ||
    editForm.departureDate !== originalDates.departure;

  const showReviewWarning =
    editing?.registration_status === "completed" && datesChanged;

  const saveEdit = async () => {
    if (!editing) return;
    setSubmitting(true);
    setModalError(null);
    const supabase = createClient();

    const { error } = await supabase.rpc("update_reservation", {
      p_reservation_id: editing.id,
      p_first_name: editForm.firstName,
      p_last_name: editForm.lastName,
      p_email: editForm.email || null,
      p_phone: editForm.phone || null,
      p_arrival_date: editForm.arrivalDate || null,
      p_departure_date: editForm.departureDate || null,
      p_guest_count: Number(editForm.guestCount) || 1,
      p_room_id: editForm.roomId || null,
      p_confirmation_number: editForm.confirmationNumber || null,
    });

    setSubmitting(false);
    if (error) {
      setModalError(friendlyRpcError(error.message));
      return;
    }
    toast.success("Reservation updated");
    setEditing(null);
    router.refresh();
  };

  const confirmCancel = async () => {
    if (!editing) return;
    setSubmitting(true);
    setModalError(null);
    const supabase = createClient();

    const { error } = await supabase.rpc("cancel_reservation", {
      p_reservation_id: editing.id,
    });

    setSubmitting(false);
    if (error) {
      setModalError(friendlyRpcError(error.message));
      return;
    }
    toast.success("Reservation cancelled");
    setEditing(null);
    router.refresh();
  };

  useEffect(() => setReservations(initialReservations ?? []), [initialReservations]);

  const getGuestName = (guests: ReservationRow["guests"]) => {
    const guestList = Array.isArray(guests) ? guests : guests ? [guests] : [];
    const guest = guestList.find((candidate) => {
      const firstName = candidate?.first_name?.trim();
      const lastName = candidate?.last_name?.trim();
      return Boolean(firstName || lastName);
    });

    if (!guest) return "Guest";

    const firstName = guest.first_name?.trim() ?? "";
    const lastName = guest.last_name?.trim() ?? "";
    const fullName = [firstName, lastName].filter(Boolean).join(" ");

    return fullName || "Guest";
  };

  const formatRegistrationStatus = (val: string | null | undefined) => {
    if (!val) return "Not started";
    const v = String(val).toLowerCase();
    if (v === "not_started" || v === "not-started" || v === "not started") return "Not started";
    if (v === "in_progress" || v === "in-progress" || v === "in progress") return "In progress";
    if (v === "completed" || v === "complete") return "Completed";
    return v.charAt(0).toUpperCase() + v.slice(1);
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return toast.error("First and last name are required");
    if (!arrivalDate) return toast.error("Arrival date required");
    if (!departureDate) return toast.error("Departure date required");

    const a = new Date(arrivalDate);
    const d = new Date(departureDate);
    if (d <= a) return toast.error("Departure date must be after arrival date");

    try {
      setLoading(true);
      const supabase = createClient();

      // Insert guest
      const guestPayload = {
        business_id: businessId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
      };

      const guestRes = await supabase.from("guests").insert([guestPayload]).select("id");
      if (guestRes.error) throw guestRes.error;
      const guestId = (guestRes.data && (guestRes.data as any[])[0]?.id) || null;
      if (!guestId) throw new Error("Failed to create guest");

      // Insert reservation
      const reservationPayload = {
        business_id: businessId,
        primary_guest_id: guestId,
        arrival_date: arrivalDate,
        departure_date: departureDate,
        guest_count: guestCount || 1,
        room_id: roomId || null,
        confirmation_number: confirmationNumber.trim() || null,
      };

      const reservationRes = await supabase.from("reservations").insert([reservationPayload]).select();
      if (reservationRes.error) {
        // cleanup orphaned guest
        try {
          await supabase.from("guests").delete().eq("id", guestId);
        } catch (cleanupErr) {
          // log but continue to surface original error
          // eslint-disable-next-line no-console
          console.error("Failed to cleanup orphaned guest", cleanupErr);
        }
        throw reservationRes.error;
      }

      toast.success("Reservation created");
      // refresh the page data
      router.refresh();

      // Optionally append to local list to reflect immediate change
      const inserted = (reservationRes.data ?? []) as ReservationRow[];
      if (inserted.length > 0) {
        setReservations((prev) => [inserted[0], ...prev]);
      }

      // clear form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setArrivalDate("");
      setDepartureDate("");
      setGuestCount(1);
      setRoomId("");
      setConfirmationNumber("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input label="Arrival date" type="date" value={arrivalDate} onChange={(e) => setArrivalDate(e.target.value)} required />
        <Input label="Departure date" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required />
        <Input label="Guest count" type="number" value={String(guestCount)} onFocus={(e) => e.target.select()} onChange={(e) => setGuestCount(Number(e.target.value || 1))} />
        <div>
          <Select
            label="Room"
            placeholder="Assign later"
            options={(rooms || []).map((r) => ({ value: r.id, label: r.room_number }))}
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        <div className="md:col-span-3">
          <Input label="Confirmation # (from your PMS)" hint="Optional — the hotel's own reference number." value={confirmationNumber} onChange={(e) => setConfirmationNumber(e.target.value)} />
        </div>

        <div className="md:col-span-3">
          <Button loading={loading} type="submit">Create reservation</Button>
        </div>
      </form>

      <div>
        {(!reservations || reservations.length === 0) ? (
          <div className="p-6 border border-dashed border-charcoal-200 rounded-md text-center text-sm text-charcoal-500">No reservations yet.</div>
        ) : (
          <ul className="space-y-3">
            {reservations.map((r) => {
              const guestName = getGuestName(r.guests);
              const arrival = r.arrival_date ? String(r.arrival_date).slice(0, 10) : "—";
              const departure = r.departure_date ? String(r.departure_date).slice(0, 10) : "—";
              const roomNumber =
                (r.rooms && typeof r.rooms === "object" && "room_number" in r.rooms && r.rooms.room_number)
                  ? r.rooms.room_number
                  : r.room_id
                    ? "Assigned"
                    : "Unassigned";
              const isCancelled = r.reservation_status === "cancelled";
              const statusLabel = isCancelled
                ? "Cancelled"
                : r.checked_in_at
                  ? "Checked in"
                  : formatRegistrationStatus(r.registration_status);

              return (
                <li
                  key={r.id}
                  onClick={() => openEdit(r)}
                  className={`flex items-center justify-between p-3 border rounded-md cursor-pointer hover:border-charcoal-300 transition-colors ${
                    isCancelled ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <div className={`font-medium ${isCancelled ? "line-through" : ""}`}>
                      {guestName}
                    </div>
                    <div className="text-sm text-charcoal-500">
                      {arrival} → {departure} • {r.guest_count ?? 1} guest{(r.guest_count ?? 1) > 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{roomNumber ?? "Unassigned"}</div>
                    <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded-md bg-charcoal-100">
                      {statusLabel}
                    </div>
                    {r.registration_review_required && !isCancelled && (
                      <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        Review required
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <Modal
        open={!!editing}
        onClose={closeModal}
        title={modalFace === "edit" ? "Edit reservation" : "Cancel reservation?"}
        size="xl"
      >
        {editing && modalFace === "edit" && (
          <div className="space-y-5">
            <div className="text-sm text-charcoal-600 pb-3 border-b border-charcoal-100">
              <div className="font-medium text-charcoal-900">{getGuestName(editing.guests)}</div>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                <span>Status: {editing.reservation_status ?? "pending"}</span>
                <span>Registration: {formatRegistrationStatus(editing.registration_status)}</span>
                {editing.confirmation_number && <span>PMS #: {editing.confirmation_number}</span>}
              </div>
            </div>

            {mode === "read_only" && (
              <div className="p-3 rounded-md bg-charcoal-100 text-sm text-charcoal-700">
                This reservation is cancelled and can no longer be changed.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="First name" value={editForm.firstName} disabled={mode === "read_only"}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} />
              <Input label="Last name" value={editForm.lastName} disabled={mode === "read_only"}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} />
              <Input label="Email" value={editForm.email} disabled={mode === "read_only"}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <Input label="Phone" value={editForm.phone} disabled={mode === "read_only"}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <Input label="Arrival date" type="date" value={editForm.arrivalDate}
                disabled={mode !== "editable"}
                hint={mode === "checked_in" ? "Arrival date is locked after check-in." : undefined}
                onChange={(e) => setEditForm({ ...editForm, arrivalDate: e.target.value })} />
              <Input label="Departure date" type="date" value={editForm.departureDate}
                disabled={mode === "read_only"}
                onChange={(e) => setEditForm({ ...editForm, departureDate: e.target.value })} />
              <Input label="Guest count" type="number" value={String(editForm.guestCount)}
                onFocus={(e) => e.target.select()}
                disabled={mode === "read_only"}
                onChange={(e) => setEditForm({ ...editForm, guestCount: Number(e.target.value || 1) })} />
              <Select label="Room" placeholder="Assign later" value={editForm.roomId}
                disabled={mode === "read_only"}
                options={(rooms || []).map((r) => ({ value: r.id, label: r.room_number }))}
                onChange={(e) => setEditForm({ ...editForm, roomId: e.target.value })} />
              <div className="md:col-span-2">
                <Input label="Confirmation # (from your PMS)" value={editForm.confirmationNumber}
                  disabled={mode === "read_only"}
                  onChange={(e) => setEditForm({ ...editForm, confirmationNumber: e.target.value })} />
              </div>
            </div>

            {showReviewWarning && (
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-sm">
                <div className="font-medium text-amber-900">Registration review required</div>
                <p className="mt-1 text-amber-800">
                  The guest already completed registration using different stay dates.
                  Saving this change will flag the reservation for review at arrival.
                </p>
              </div>
            )}

            {mode !== "read_only" && (
              <div className="pt-4 border-t border-charcoal-100">
                <div className="text-sm font-medium text-charcoal-900 mb-2">
                  Guest registration link
                </div>

                {linkUrl ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
                      <p className="text-xs text-emerald-800 mb-2">
                        Copy this now — it is shown only once and cannot be retrieved later.
                      </p>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={linkUrl}
                          onFocus={(e) => e.target.select()}
                          className="flex-1 text-xs px-2 py-1.5 rounded border border-emerald-300 bg-white font-mono"
                        />
                        <Button type="button" onClick={handleCopy}>
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-charcoal-600">
                      {linkState.kind === "active" &&
                        `A link is active until ${new Date(linkState.expiresAt).toLocaleString()}.`}
                      {linkState.kind === "expired" && "The previous link has expired."}
                      {linkState.kind === "completed" && "The guest has completed registration."}
                      {linkState.kind === "none" && "No registration link has been created yet."}
                    </p>

                    {linkState.kind === "active" && (
                      <p className="text-xs text-amber-700">
                        Creating a new link will invalidate the guest&apos;s existing link.
                      </p>
                    )}

                    {linkState.kind !== "completed" && (
                      <Button type="button" onClick={handleCreateLink} loading={creatingLink}>
                        {linkState.kind === "none" ? "Create registration link" : "Create new link"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            {modalError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
                {modalError}
              </div>
            )}

            {mode !== "read_only" && (
              <div className="flex items-center justify-between pt-3 border-t border-charcoal-100">
                {mode === "editable" ? (
                  <button type="button" onClick={() => { setModalError(null); setModalFace("confirm_cancel"); }}
                    className="text-sm text-red-600 hover:text-red-700">
                    Cancel reservation
                  </button>
                ) : <span />}
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={closeModal} disabled={submitting}>
                    Close
                  </Button>
                  <Button type="button" onClick={saveEdit} loading={submitting}>
                    Save changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {editing && modalFace === "confirm_cancel" && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-700">
              This will cancel {getGuestName(editing.guests)}&apos;s reservation and revoke all
              active registration links. Completed registration records and signatures
              will be preserved.
            </p>

            {modalError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-charcoal-100">
              <Button type="button" variant="secondary" disabled={submitting}
                onClick={() => { setModalError(null); setModalFace("edit"); }}>
                Keep reservation
              </Button>
              <Button type="button" onClick={confirmCancel} loading={submitting}>
                Cancel reservation
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
