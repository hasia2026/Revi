"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Compass, X, Plus } from "lucide-react";
import { isCompassReadyForGeneration, type CompanyCompass } from "@/lib/supabase/compass";

type Props = { compass: CompanyCompass | null; businessId: string };

type FormState = {
  vision: string;
  mission: string;
  constitution: string;
  core_values: string[];
  company_story: string;
  customer_promise: string;
  employee_promise: string;
  leadership_principles: string[];
  brand_voice: string;
  elevator_pitch: string;
};

function toFormState(c: CompanyCompass | null): FormState {
  return {
    vision: c?.vision ?? "",
    mission: c?.mission ?? "",
    constitution: c?.constitution ?? "",
    core_values: c?.core_values ?? [],
    company_story: c?.company_story ?? "",
    customer_promise: c?.customer_promise ?? "",
    employee_promise: c?.employee_promise ?? "",
    leadership_principles: c?.leadership_principles ?? [],
    brand_voice: c?.brand_voice ?? "",
    elevator_pitch: c?.elevator_pitch ?? "",
  };
}

function TagListField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setDraft("");
  }

  return (
    <div>
      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">{label}</label>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2.5">
          {values.map((v, i) => (
            <Badge key={`${v}-${i}`} variant="gold">
              <span className="flex items-center gap-1.5">
                {v}
                <button
                  type="button"
                  onClick={() => onChange(values.filter((_, idx) => idx !== i))}
                  className="hover:text-charcoal-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompassEditor({ compass: initial, businessId }: Props) {
  const [compass, setCompass] = useState(initial);
  const [form, setForm] = useState<FormState>(toFormState(initial));
  const [saving, setSaving] = useState(false);

  const ready = isCompassReadyForGeneration(compass);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("company_compass")
      .upsert({ business_id: businessId, ...form }, { onConflict: "business_id" })
      .select()
      .single();

    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setCompass(data);
    toast.success("Company Compass saved");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-charcoal-900 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Compass className="h-5 w-5 text-gold-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-charcoal-900">Company Compass</h1>
            <p className="text-sm text-charcoal-500 mt-0.5 max-w-xl">
              The single source of truth for who this business is. Website Builder,
              Marketing, and your AI Ambassador will generate content from what you
              fill in here.
            </p>
          </div>
        </div>
        <Badge variant={ready ? "success" : "default"} size="sm">
          {ready ? "Ready to generate from" : "Incomplete"}
        </Badge>
      </div>

      <section className="bg-white border border-charcoal-100 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wide">Identity</h2>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Vision</label>
          <Textarea rows={2} value={form.vision} onChange={(e) => update("vision", e.target.value)}
            placeholder="The future this business is working toward." />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Mission</label>
          <Textarea rows={2} value={form.mission} onChange={(e) => update("mission", e.target.value)}
            placeholder="What this business does, and for whom." />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Constitution</label>
          <Textarea rows={3} value={form.constitution} onChange={(e) => update("constitution", e.target.value)}
            placeholder="The non-negotiable principles this business operates by." />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Company Story</label>
          <Textarea rows={4} value={form.company_story} onChange={(e) => update("company_story", e.target.value)}
            placeholder="How this business started and why." />
        </div>
      </section>

      <section className="bg-white border border-charcoal-100 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wide">Values & Principles</h2>
        <TagListField
          label="Core Values"
          values={form.core_values}
          onChange={(v) => update("core_values", v)}
          placeholder="e.g. Integrity — press Enter to add"
        />
        <TagListField
          label="Leadership Principles"
          values={form.leadership_principles}
          onChange={(v) => update("leadership_principles", v)}
          placeholder="e.g. Ownership — press Enter to add"
        />
      </section>

      <section className="bg-white border border-charcoal-100 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wide">Promises</h2>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Customer Promise</label>
          <Textarea rows={2} value={form.customer_promise} onChange={(e) => update("customer_promise", e.target.value)}
            placeholder="What every customer can count on." />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Employee Promise</label>
          <Textarea rows={2} value={form.employee_promise} onChange={(e) => update("employee_promise", e.target.value)}
            placeholder="What every team member can count on." />
        </div>
      </section>

      <section className="bg-white border border-charcoal-100 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wide">Voice</h2>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Brand Voice</label>
          <Textarea rows={2} value={form.brand_voice} onChange={(e) => update("brand_voice", e.target.value)}
            placeholder="How this business sounds — tone, style, what to avoid." />
        </div>
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Elevator Pitch</label>
          <Textarea rows={2} value={form.elevator_pitch} onChange={(e) => update("elevator_pitch", e.target.value)}
            placeholder="Explain this business in one breath." />
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          Save Compass
        </Button>
      </div>
    </div>
  );
}
