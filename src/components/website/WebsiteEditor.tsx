"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Save, Globe, Eye, EyeOff } from "lucide-react";
import type { WebsiteSettings } from "@/types/database";

interface Props {
  settings: WebsiteSettings | null;
  businessId: string;
  businessName: string;
}

export function WebsiteEditor({ settings: initial, businessId, businessName }: Props) {
  const [settings, setSettings] = useState(initial);
  const [form, setForm] = useState({
    site_title_en: initial?.site_title_en ?? `Welcome to ${businessName}`,
    tagline_en: initial?.tagline_en ?? "Your trusted local service provider",
    primary_color: initial?.primary_color ?? "#C9931A",
    secondary_color: initial?.secondary_color ?? "#1A1A1C",
    font_family: "Inter", // Not persisted - website_settings has no font_family column.
    custom_domain: "", // Not persisted - website_settings has no custom_domain column.
    published: initial?.published ?? false,
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const payload = {
      site_title_en: form.site_title_en,
      tagline_en: form.tagline_en,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      published: form.published,
    };

    if (settings) {
      const { data, error } = await supabase
        .from("website_settings")
        .update(payload)
        .eq("id", settings.id)
        .select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      setSettings(data);
    } else {
      const { data, error } = await supabase
        .from("website_settings")
        .insert({ business_id: businessId, ...payload })
        .select().single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      setSettings(data);
    }

    toast.success("Website settings saved");
    setSaving(false);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings panel */}
        <div className="lg:col-span-2 space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-charcoal-800 mb-4 flex items-center gap-2">
              <Globe className="h-4 w-4 text-gold-500" />
              Hero Section
            </h3>
            <div className="space-y-4">
              <Input
                label="Hero title"
                value={form.site_title_en}
                onChange={(e) => setForm({ ...form, site_title_en: e.target.value })}
                placeholder="Welcome to Your Business"
              />
              <Input
                label="Hero subtitle"
                value={form.tagline_en}
                onChange={(e) => setForm({ ...form, tagline_en: e.target.value })}
                placeholder="Your trusted service provider"
              />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-charcoal-800 mb-4">Design</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Primary color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-charcoal-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-charcoal-600 font-mono">{form.primary_color}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Secondary color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                    className="h-9 w-12 rounded-lg border border-charcoal-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-charcoal-600 font-mono">{form.secondary_color}</span>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Font family</label>
              <select
                value={form.font_family}
                onChange={(e) => setForm({ ...form, font_family: e.target.value })}
                className="w-full rounded-lg border border-charcoal-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400"
              >
                {["Inter", "Roboto", "Poppins", "Lato", "Montserrat", "Playfair Display"].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-charcoal-800 mb-4">Domain</h3>
            <Input
              label="Custom domain"
              value={form.custom_domain}
              onChange={(e) => setForm({ ...form, custom_domain: e.target.value })}
              placeholder="yourbusiness.com"
              hint="Point your domain's DNS to our servers after saving"
            />
          </div>

          <Button variant="gold" size="lg" onClick={handleSave} loading={saving} className="w-full">
            <Save className="h-4 w-4" /> Save Website Settings
          </Button>
        </div>

        {/* Status sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-semibold text-charcoal-800 mb-4">Status</h3>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-charcoal-600">Website</span>
              <Badge variant={form.published ? "success" : "default"}>
                {form.published ? "Live" : "Unpublished"}
              </Badge>
            </div>
            <Button
              variant={form.published ? "secondary" : "gold"}
              size="sm"
              className="w-full"
              onClick={() => setForm({ ...form, published: !form.published })}
            >
              {form.published ? (
                <><EyeOff className="h-4 w-4" /> Unpublish</>
              ) : (
                <><Eye className="h-4 w-4" /> Publish Website</>
              )}
            </Button>
          </div>

          {/* Preview */}
          <div className="card p-5 overflow-hidden">
            <h3 className="font-semibold text-charcoal-800 mb-3 text-sm">Preview</h3>
            <div
              className="rounded-xl p-6 text-white text-center"
              style={{ background: `linear-gradient(135deg, ${form.secondary_color}, ${form.primary_color})` }}
            >
              <p className="font-bold text-base leading-tight" style={{ fontFamily: form.font_family }}>
                {form.site_title_en || businessName}
              </p>
              <p className="text-xs opacity-80 mt-1.5 leading-relaxed" style={{ fontFamily: form.font_family }}>
                {form.tagline_en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
