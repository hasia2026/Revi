"use client";

import { useState } from "react";
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
  "Photography", "Events & Catering", "Other",
];

const schema = z.object({
  businessName: z.string().min(2, "Business name required"),
  industry: z.string().min(1, "Select an industry"),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
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

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Create business
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name: data.businessName,
        industry: data.industry,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        website: data.website || null,
      })
      .select()
      .single();

    if (bizError) { toast.error(bizError.message); return; }

    // Add owner as admin member
    await supabase.from("business_members").insert({
      business_id: business.id,
      user_id: user.id,
      role: "admin",
    });

    toast.success("Business set up successfully!");
    router.push("/dashboard");
  }

  async function nextStep() {
    const fields: Record<number, (keyof FormData)[]> = {
      1: ["businessName", "industry"],
      2: ["address", "city", "state"],
    };
    const valid = await trigger(fields[step]);
    if (valid) setStep((s) => s + 1);
  }

  const fieldClass = "w-full rounded-lg border border-charcoal-700 bg-charcoal-800 px-3.5 py-2.5 text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-medium text-charcoal-300 mb-1.5";
  const errorClass = "mt-1.5 text-xs text-red-400";

  return (
    <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-1">Set up your business</h2>
      <p className="text-charcoal-400 text-sm mb-6">Tell us about your business to get started</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 transition-all ${
              step > s.id
                ? "bg-gold-500 text-white"
                : step === s.id
                ? "bg-gold-500/20 border-2 border-gold-500 text-gold-400"
                : "bg-charcoal-800 border border-charcoal-600 text-charcoal-500"
            }`}>
              {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
            </div>
            <span className={`text-xs hidden sm:block ${step >= s.id ? "text-charcoal-300" : "text-charcoal-600"}`}>{s.title}</span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px ${step > s.id ? "bg-gold-500/40" : "bg-charcoal-700"}`} />
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
              <select {...register("industry")} className={fieldClass}>
                <option value="">Select your industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
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
              <input {...register("website")} type="url" placeholder="https://yourbusiness.com" className={fieldClass} />
              {errors.website && <p className={errorClass}>{errors.website.message}</p>}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={() => setStep((s) => s - 1)} className="flex-1 bg-charcoal-800 border-charcoal-700 text-charcoal-300 hover:bg-charcoal-700 hover:text-white">
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button type="button" variant="gold" onClick={nextStep} className="flex-1">
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="gold" loading={isSubmitting} className="flex-1">
              Launch Revi
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
