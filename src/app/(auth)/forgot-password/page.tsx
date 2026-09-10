"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      toast.error("Enter your email address");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Unable to send reset email. Please try again.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-cue-glow">
      <h2 className="text-xl font-semibold text-white mb-1">
        Reset your password
      </h2>
      <p className="text-charcoal-400 text-sm mb-7">
        Enter your email and we&apos;ll send you a password reset link.
      </p>

      {sent ? (
        <div className="space-y-5">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-charcoal-300">
              If an account exists for that email, a reset link has been sent.
            </p>
          </div>

          <Link
            href="/login"
            className="block text-center text-sm text-cue-blue-400 hover:text-cue-blue-300 font-medium transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-cue-blue-400 focus:border-transparent transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="cue"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Send reset link
            </Button>
          </form>

          <p className="text-center text-sm text-charcoal-500 mt-6">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-cue-blue-400 hover:text-cue-blue-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
