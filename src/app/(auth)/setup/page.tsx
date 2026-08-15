"use client";

import { useState, useEffect, useRef } from "react";
import type { MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Building2, MapPin, Phone, Globe, Check } from "lucide-react";

const INDUSTRIES = [
  "Salon & Beauty", "Spa & Wellness", "Fitness & Gym", "Home Services",
  "Cleaning Services", "Auto Repair", "Pet Services", "Tutoring & Education",
  "Photography", "Events & Catering", "Hospitality (Hotels)", "Other",
];

const schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  industry: z.string().min(1, "Select an industry"),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.preprocess(
    (v) => {
      const s = typeof v === "string" ? v.trim() : "";
      if (!s) return "";
      return /^https?:\/\//i.test(s) ? s : `https://${s}`;
    },
    z.string().url("Enter a valid website").or(z.literal("")
  ),
});

type FormData = z.infer<typeof schema>;

const STEPS = [
  { id: 1, title: "Business info", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Contact", icon: Phone },
];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [checkingExisting, setCheckingExisting] = useState(true);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    let cancelled = false;

    async function checkExistingBusiness() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: membership } = await supabase
        .from("business_members")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (membership) {
        // Already set up — don't let them create a second business.
        router.replace("/dashboard");
        return;
      }

      setCheckingExisting(false);
    }

    checkExistingBusiness();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Re-check right before writing — guards against a second tab/request
    // completing setup between the mount-time check above and this submit.
    const { data: existingMembership } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingMembership) {
      toast.error("You already have a business set up.");
      router.push("/dashboard");
      return;
    }

    // Create business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: data.businessName,
        industry: data.industry,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
      })
      .select()
      .single();

    if (bizError) { toast.error(bizError.message); return; }

    // Seed default website settings so /website never has to handle a
    // missing row for a brand-new business.
    const { error: websiteError } = await supabase.from("website_settings").insert({
      business_id: business.id,
      site_title_en: data.businessName,
      site_title_es: "",
      tagline_en: "Your trusted local service provider",
      tagline_es: "",
    });

    if (websiteError) { console.error("Failed to seed website settings:", websiteError.message); }

    toast.success("Business set up successfully!");
    router.push("/dashboard");
  }

  const advancingRef = useRef(false);

  async function nextStep(e?: MouseEvent<HTMLButtonElement>) {
    // Prevent default in one central place so clicks can't fall through to the form
    e?.preventDefault();
    // Diagnostic log to detect double invocations during user testing
    console.log("nextStep called, current step:", step);
    if (advancingRef.current) return;
    advancingRef.current = true;
    try {
      const fields: Record<number, (keyof FormData)[]> = {
        1: ["businessName", "industry"],
        2: ["address", "city", "state"],
      };
      const valid = await trigger(fields[step]);
      if (valid) setStep((s) => s + 1);
    } finally {
      advancingRef.current = false;
    }
  }

  const fieldClass = "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-cue-blue-400 focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-medium text-charcoal-300 mb-1.5";
  const errorClass = "mt-1.5 text-xs text-red-400";

  if (checkingExisting) {
    return (
      <div className="glass-panel rounded-2xl p-8 shadow-cue-glow">
        <p className="text-charcoal-400 text-sm">Checking your account…</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-cue-glow">
      <h2 className="text-xl font-semibold text-white mb-1">Set up your business</h2>
      <p className="text-charcoal-400 text-sm mb-6">Tell us about your business to get started</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
              step > s.id
                ? "cue-gradient text-white"
                : step === s.id
                ? "bg-white/5 border-2 border-cue-blue-400 text-cue-blue-400"
                : "bg-white/5 border border-white/10 text-charcoal-500"
            }`}>
              {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
            </div>
            <span className={`text-xs hidden sm:block ${step >= s.id ? "text-charcoal-300" : "text-charcoal-600"}`}>{s.title}</span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${step > s.id ? "cue-gradient" : "bg-white/10"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Business name *</label>
              <input {...register("businessName")} placeholder="Luxe Salon & Spa" className={fieldClass} />
              {errors.businessName && <p className={errorClass}>{errors.businessName.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Industry *</label>
             <select {...register("industry")} className={`${fieldClass} bg-charcoal-900`}>
                <option value="" className="bg-charcoal-900 text-white">Select your industry</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i} className="bg-charcoal-900 text-white">{i}</option>
                ))}
              </select>
              {errors.industry && <p className={errorClass}>{errors.industry.message}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Street address</label>
              <input {...register("address")} placeholder="123 Main St" className={fieldClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>City</label>
                <input {...register("city")} placeholder="New York" className={fieldClass} />
              </div>
              <div>
                <label className={labelClass}>State</label>
                <input {...register("state")} placeholder="NY" className={fieldClass} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Business phone</label>
              <input {...register("phone")} type="tel" placeholder="+1 (555) 000-0000" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Business email</label>
              <input {...register("email")} type="email" placeholder="hello@yourbusiness.com" className={fieldClass} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Website</label>
              <input {...register("website")} type="text" placeholder="www.yourbusiness.com" className={fieldClass} />
              {errors.website && <p className={errorClass}>{errors.website.message}</p>}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1 bg-white/5 border-white/10 text-charcoal-300 hover:bg-white/10 hover:text-white">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" variant="cue" onClick={nextStep} className="flex-1">
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="cue" loading={isSubmitting} className="flex-1">
              Launch CUE
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
