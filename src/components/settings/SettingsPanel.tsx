"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Save, Plus, Trash2, Users, Briefcase, User, DollarSign } from "lucide-react";
import type { Profile, Service } from "@/types/database";
import { formatCurrency } from "@/lib/utils";
import { INDUSTRIES } from "@/lib/industries";

const TABS = ["Profile", "Business", "Services", "Team"];

interface Member {
  id: string;
  role: string;
  user_id: string;
  profiles: { full_name: string | null; email: string | null; avatar_url: string | null } | null;
}

interface Props {
  profile: Profile | null;
  business: Record<string, unknown> | null;
  businessSettings: Record<string, unknown> | null;
  businessId: string;
  role: string;
  services: Service[];
  members: Member[];
  userId: string;
  userEmail: string;
}

export function SettingsPanel({ profile, business, businessSettings, businessId, role, services: initServices, members: initMembers, userId, userEmail }: Props) {
  const [tab, setTab] = useState("Profile");
  const [services, setServices] = useState(initServices);
  const [members, setMembers] = useState(initMembers);

  const [profileForm, setProfileForm] = useState({ full_name: profile?.full_name ?? "" });
  const [bizForm, setBizForm] = useState({
    name: (business?.name as string) ?? "",
    industry: (business?.industry as string) ?? "",
    phone: (business?.phone as string) ?? "",
    email: (business?.email as string) ?? "",
    address: (businessSettings?.address as string) ?? "",
    city: (businessSettings?.city as string) ?? "",
    state: (businessSettings?.state as string) ?? "",
    website: (business?.website as string) ?? "",
  });

  const [svcOpen, setSvcOpen] = useState(false);
  const [svcForm, setSvcForm] = useState({ name: "", description: "", price: "", duration: "" });
  const [saving, setSaving] = useState(false);

  async function saveProfile() {
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: profileForm.full_name }).eq("id", userId);
    if (error) { toast.error(error.message); } else { toast.success("Profile updated"); }
    setSaving(false);
  }

  async function saveBusiness() {
    setSaving(true);
    const supabase = createClient();

    const { error } = await supabase.from("businesses").update({
      name: bizForm.name,
      industry: bizForm.industry || null,
      phone: bizForm.phone || null,
      email: bizForm.email || null,
      website: bizForm.website || null,
    }).eq("id", businessId);

    if (error) { toast.error(error.message); setSaving(false); return; }

    // Address fields live on business_settings, not businesses. Upsert
    // since older businesses may predate this table getting seeded at setup.
    const { error: settingsError } = await supabase.from("business_settings").upsert(
      {
        business_id: businessId,
        address: bizForm.address || null,
        city: bizForm.city || null,
        state: bizForm.state || null,
      },
      { onConflict: "business_id" }
    );

    if (settingsError) { toast.error(settingsError.message); } else { toast.success("Business info updated"); }
    setSaving(false);
  }

  async function createService() {
    if (!svcForm.name.trim()) { toast.error("Service name required"); return; }
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("services")
      .insert({
        business_id: businessId,
        name_en: svcForm.name,
        description_en: svcForm.description || null,
        price: svcForm.price ? Number(svcForm.price) : null,
        active: true,
      })
      .select().single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    setServices((p) => [data, ...p]);
    setSvcOpen(false);
    setSvcForm({ name: "", description: "", price: "", duration: "" });
    toast.success("Service added");
    setSaving(false);
  }

  async function deleteService(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setServices((p) => p.filter((s) => s.id !== id));
    toast.success("Service removed");
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        {/* Tab nav */}
        <div className="flex border-b border-charcoal-200 mb-6 -mx-1 gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                tab === t
                  ? "text-gold-600 border-b-2 border-gold-500 bg-gold-50/50"
                  : "text-charcoal-500 hover:text-charcoal-800 hover:bg-charcoal-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === "Profile" && (
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-4 pb-4 border-b border-charcoal-100">
              <Avatar name={profile?.full_name || userEmail} size="xl" />
              <div>
                <p className="font-semibold text-charcoal-900">{profile?.full_name || "—"}</p>
                <p className="text-sm text-charcoal-500">{userEmail}</p>
                <Badge variant="gold" className="mt-1">{role}</Badge>
              </div>
            </div>
            <Input label="Full name" value={profileForm.full_name} onChange={(e) => setProfileForm({ full_name: e.target.value })} placeholder="Your full name" />
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Email</label>
              <input disabled value={userEmail} className="w-full rounded-lg border border-charcoal-200 bg-charcoal-50 px-3.5 py-2.5 text-sm text-charcoal-500 cursor-not-allowed" />
              <p className="mt-1.5 text-xs text-charcoal-400">Email cannot be changed here</p>
            </div>
            <Button variant="gold" onClick={saveProfile} loading={saving}>
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        )}

        {/* Business tab */}
        {tab === "Business" && (
          <div className="card p-6 space-y-5">
            <Input label="Business name" value={bizForm.name} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} />
            <Select
              label="Industry"
              value={bizForm.industry}
              onChange={(e) => setBizForm({ ...bizForm, industry: e.target.value })}
              options={INDUSTRIES.map((i) => ({ value: i, label: i }))}
              placeholder="Select industry"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Phone" value={bizForm.phone} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} />
              <Input label="Email" type="email" value={bizForm.email} onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })} />
            </div>
            <Input label="Website" value={bizForm.website} onChange={(e) => setBizForm({ ...bizForm, website: e.target.value })} placeholder="https://" />
            <Input label="Address" value={bizForm.address} onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={bizForm.city} onChange={(e) => setBizForm({ ...bizForm, city: e.target.value })} />
              <Input label="State" value={bizForm.state} onChange={(e) => setBizForm({ ...bizForm, state: e.target.value })} />
            </div>
            <Button variant="gold" onClick={saveBusiness} loading={saving}>
              <Save className="h-4 w-4" /> Save Business Info
            </Button>
          </div>
        )}

        {/* Services tab */}
        {tab === "Services" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-charcoal-500">{services.length} service{services.length !== 1 ? "s" : ""}</p>
              <Button variant="gold" size="sm" onClick={() => setSvcOpen(true)}>
                <Plus className="h-4 w-4" /> Add Service
              </Button>
            </div>
            {services.length === 0 ? (
              <div className="card">
                <EmptyState icon={Briefcase} title="No services yet" description="Add the services your business offers." action={<Button variant="gold" size="sm" onClick={() => setSvcOpen(true)}><Plus className="h-4 w-4" /> Add Service</Button>} />
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((svc) => (
                  <div key={svc.id} className="card p-4 flex items-center gap-4 group">
                    <div className="h-9 w-9 rounded-lg bg-gold-50 border border-gold-100 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-4 w-4 text-gold-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-charcoal-800">{svc.name_en}</p>
                        <Badge variant={svc.active ? "success" : "default"}>{svc.active ? "Active" : "Inactive"}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-charcoal-400">
                        {svc.price != null && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{formatCurrency(svc.price)}</span>}
                        {svc.description_en && <span className="truncate">{svc.description_en}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteService(svc.id)} className="p-1.5 rounded hover:bg-red-50 text-charcoal-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Team tab */}
        {tab === "Team" && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-500">{members.length} team member{members.length !== 1 ? "s" : ""}</p>
            {members.length === 0 ? (
              <div className="card">
                <EmptyState icon={Users} title="No team members" description="Invite team members to collaborate." />
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="card p-4 flex items-center gap-4">
                    <Avatar name={m.profiles?.full_name || m.profiles?.email} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-800 truncate">{m.profiles?.full_name || "—"}</p>
                      <p className="text-sm text-charcoal-500 truncate">{m.profiles?.email}</p>
                    </div>
                    <Badge variant={m.role === "admin" ? "gold" : "default"}>{m.role}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Service modal */}
      <Modal open={svcOpen} onClose={() => setSvcOpen(false)} title="Add Service" size="sm">
        <div className="space-y-4">
          <Input label="Service name *" value={svcForm.name} onChange={(e) => setSvcForm({ ...svcForm, name: e.target.value })} placeholder="e.g. Haircut" />
          <Input label="Description" value={svcForm.description} onChange={(e) => setSvcForm({ ...svcForm, description: e.target.value })} placeholder="Brief description" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Price ($)" type="number" value={svcForm.price} onChange={(e) => setSvcForm({ ...svcForm, price: e.target.value })} placeholder="45" />
            <Input label="Duration (min)" type="number" value={svcForm.duration} onChange={(e) => setSvcForm({ ...svcForm, duration: e.target.value })} placeholder="60" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSvcOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="gold" onClick={createService} loading={saving} className="flex-1">Add Service</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
