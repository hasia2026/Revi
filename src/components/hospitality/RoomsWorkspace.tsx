"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { Power } from "lucide-react";

type RoomRow = {
  id: string;
  room_number: string;
  floor: string | number | null;
  room_type: string | null;
  active: boolean;
};

export default function RoomsWorkspace({
  businessId,
  initialRooms,
}: {
  businessId: string;
  initialRooms: RoomRow[];
}) {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomRow[]>(() =>
    (initialRooms ?? []).slice().sort((a, b) => {
      const na = Number(a.room_number);
      const nb = Number(b.room_number);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return String(a.room_number).localeCompare(String(b.room_number));
    })
  );

  const [mode, setMode] = useState<"single" | "range">("single");
  const [roomNumber, setRoomNumber] = useState("");
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [floor, setFloor] = useState("");
  const [roomType, setRoomType] = useState("");
  const [loading, setLoading] = useState(false);

  const isDigitsOnly = (value: string) => /^\d+$/.test(value.trim());

  useEffect(() => {
    setRooms((initialRooms ?? []).slice().sort((a, b) => {
      const na = Number(a.room_number);
      const nb = Number(b.room_number);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
      return String(a.room_number).localeCompare(String(b.room_number));
    }));
  }, [initialRooms]);

  const addSingle = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const num = roomNumber.trim();
    if (!num) return toast.error("Room number required");
    if (!isDigitsOnly(num)) return toast.error("Room numbers must be digits only.");

    try {
      setLoading(true);
      const supabase = createClient();
      const payload = [{
        business_id: businessId,
        room_number: num,
        floor: floor || null,
        room_type: roomType || null,
        active: true,
      }];

      const res = await supabase
        .from("rooms")
        .upsert(payload, { onConflict: "business_id,room_number", ignoreDuplicates: true })
        .select("id, room_number, floor, room_type, active");
      if (res.error) throw res.error;

      const inserted = (res.data ?? []) as RoomRow[];
      if (inserted.length === 0) {
        toast.success("That room already exists.");
        return;
      }

      setRooms((prev) => {
        const next = prev.concat(inserted);
        next.sort((a, b) => Number(a.room_number) - Number(b.room_number));
        return next;
      });
      setRoomNumber("");
      router.refresh();
      toast.success("Room added");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to add room");
    } finally {
      setLoading(false);
    }
  };

  const addRange = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const fromValue = rangeFrom.trim();
    const toValue = rangeTo.trim();
    if (!isDigitsOnly(fromValue) || !isDigitsOnly(toValue)) return toast.error("Room numbers must be digits only.");

    const from = Number(fromValue);
    const to = Number(toValue);
    if (!Number.isFinite(from) || !Number.isFinite(to)) return toast.error("Room numbers must be digits only.");
    if (to < from) return toast.error("Range: 'to' must be >= 'from'");
    if (to - from + 1 > 200) return toast.error("Range size cannot exceed 200");

    const payload = [] as Array<{
      business_id: string;
      room_number: string;
      floor: string | number | null;
      room_type: string | null;
      active: boolean;
    }>;
    for (let n = from; n <= to; n++) {
      payload.push({
        business_id: businessId,
        room_number: String(n),
        floor: floor || null,
        room_type: roomType || null,
        active: true,
      });
    }

    try {
      setLoading(true);
      const supabase = createClient();
      const res = await supabase
        .from("rooms")
        .upsert(payload, { onConflict: "business_id,room_number", ignoreDuplicates: true })
        .select("id, room_number, floor, room_type, active");
      if (res.error) throw res.error;

      const inserted = (res.data ?? []) as RoomRow[];
      if (inserted.length === 0) {
        toast.success("Those rooms already exist.");
        return;
      }

      setRooms((prev) => {
        const next = prev.concat(inserted);
        next.sort((a, b) => {
          const na = Number(a.room_number);
          const nb = Number(b.room_number);
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
          return String(a.room_number).localeCompare(String(b.room_number));
        });
        return next;
      });
      setRangeFrom("");
      setRangeTo("");
      router.refresh();
      toast.success(`${inserted.length} rooms added`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to add rooms");
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (room: RoomRow) => {
    try {
      const supabase = createClient();
      const res = await supabase.from("rooms").update({ active: !room.active }).eq("id", room.id).select();
      if (res.error) throw res.error;
      const updated = (res.data ?? [])[0] as RoomRow | undefined;
      if (updated) {
        setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)).sort((a, b) => {
          const na = Number(a.room_number);
          const nb = Number(b.room_number);
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
          return String(a.room_number).localeCompare(String(b.room_number));
        }));
      }
      router.refresh();
      toast.success("Updated room");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Failed to update room");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant={mode === "single" ? "gold" : "secondary"} onClick={() => setMode("single")}>Add one</Button>
        <Button variant={mode === "range" ? "gold" : "secondary"} onClick={() => setMode("range")}>Add a range</Button>
      </div>

      <form onSubmit={mode === "single" ? addSingle : addRange} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {mode === "single" ? (
          <Input label="Room number" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input label="First room #" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
              <Input label="Last room #" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
            </div>
            <p className="text-xs text-charcoal-400">Creates every room number in this range — e.g. 201 to 220 creates 20 rooms.</p>
          </div>
        )}

        <Input label="Floor" value={floor} onChange={(e) => setFloor(e.target.value)} />
        <Input label="Type" value={roomType} onChange={(e) => setRoomType(e.target.value)} />
        <div className="md:col-span-1">
          <Button loading={loading} type="submit">Add</Button>
        </div>
      </form>

      <div>
        {rooms.length === 0 ? (
          <div className="p-6 border border-dashed border-charcoal-200 rounded-md text-center text-sm text-charcoal-500">No rooms yet. Add one or a range to get started.</div>
        ) : (
          <ul className="space-y-2">
            {rooms.slice().sort((a,b)=>{
              const na = Number(a.room_number);
              const nb = Number(b.room_number);
              if (!Number.isNaN(na) && !Number.isNaN(nb)) return na-nb;
              return String(a.room_number).localeCompare(String(b.room_number));
            }).map((r) => (
              <li key={r.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-4">
                  <div className="font-medium">{r.room_number}</div>
                  <div className="text-sm text-charcoal-500">{r.room_type ?? "—"}</div>
                  <div className="text-sm text-charcoal-500">Floor: {r.floor ?? "—"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`text-sm ${r.active ? "text-green-500" : "text-red-500"}`}>{r.active ? "Active" : "Inactive"}</div>
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(r)}>
                    <Power className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
