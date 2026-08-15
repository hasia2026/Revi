import { ModuleFramework } from "@/components/cu3/ModuleFramework";
import type { ModuleConfig } from "@/lib/cu3/module-framework";
import { BedDouble, Power } from "lucide-react";
import { getModulePageContext } from "@/lib/cu3/get-module-context";
import { createClient } from "@/lib/supabase/server";
import RoomsWorkspace from "@/components/hospitality/RoomsWorkspace";

export default async function RoomsPage() {
  const { businessId, businessName } = await getModulePageContext();
  const supabase = await createClient();

  const { data } = await supabase
    .from("rooms")
    .select("id, room_number, floor, room_type, active")
    .eq("business_id", businessId)
    .order("room_number", { ascending: true });

  const list = (data ?? []) as {
    id: string;
    room_number: string;
    floor: string | number | null;
    room_type: string | null;
    active: boolean;
  }[];

  const total = list.length;
  const activeCount = list.filter((r) => r.active).length;
  const distinctFloors = Array.from(new Set(list.map((r) => String(r.floor ?? "")).filter(Boolean))).length;
  const distinctTypes = Array.from(new Set(list.map((r) => String(r.room_type ?? "")).filter(Boolean))).length;

  const config: ModuleConfig = {
    key: "rooms",
    title: "Rooms",
    description: "Manage hotel rooms for your property",
    icon: BedDouble,
    status: "active",
    aiAssistant: { name: "Room Assistant", tagline: "Help managing rooms and availability" },
    overviewCards: [
      { label: "Total rooms", value: String(total), icon: BedDouble },
      { label: "Active", value: String(activeCount), icon: Power },
      { label: "Floors", value: String(distinctFloors), icon: BedDouble },
      { label: "Room types", value: String(distinctTypes), icon: BedDouble },
    ],
    quickActions: [],
    insights: [],
    relatedModules: [],
    activity: [],
    businessContext: businessName ?? undefined,
  };

  return (
    <ModuleFramework config={config}>
      <RoomsWorkspace businessId={businessId} initialRooms={list} />
    </ModuleFramework>
  );
}
