"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${window.location.origin}/setup`,
      },
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created! Check your email to confirm.");
    router.push("/setup");
  }

  const fieldClass = "w-full rounded-lg border border-charcoal-700 bg-charcoal-800 px-3.5 py-2.5 text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent transition-colors";
  const labelClass = "block text-sm font-medium text-charcoal-300 mb-1.5";
  const errorClass = "mt-1.5 text-xs text-red-400";

  return (
    <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl p-8 shadow-2xl">
      <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
      <p className="text-charcoal-400 text-sm mb-7">Start your Revi journey today</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelClass}>Full name</label>
          <input {...register("fullName")} type="text" placeholder="Jane Smith" autoComplete="name" className={fieldClass} />
          {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Email</label>
          <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={fieldClass} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={`${fieldClass} pr-10`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-300">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className={errorClass}>{errors.password.message}</p>}
        </div>

        <div>
          <label className={labelClass}>Confirm password</label>
          <input
            {...register("confirmPassword")}
            type={showPassword ? "text" : "password"}
            placeholder="Repeat password"
            autoComplete="new-password"
            className={fieldClass}
          />
          {errors.confirmPassword && <p className={errorClass}>{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" variant="gold" size="lg" loading={isSubmitting} className="w-full mt-2">
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-charcoal-500 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-gold-400 hover:text-gold-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
