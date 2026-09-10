"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" || session) {
        setHasSession(true);
        setIsCheckingSession(false);
        return;
      }

      if (event === "SIGNED_OUT") {
        setHasSession(false);
        setIsCheckingSession(false);
      }
    });

    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session) {
        setHasSession(true);
        setIsCheckingSession(false);
        return;
      }

      // A PKCE recovery code may still be processing in the browser.
      // Give Supabase a moment to emit PASSWORD_RECOVERY before showing
      // the invalid/expired-link state.
      window.setTimeout(async () => {
        const {
          data: { session: delayedSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setHasSession(Boolean(delayedSession));
        setIsCheckingSession(false);
      }, 1500);
    }

    void checkExistingSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("Unable to update password. Please request a new reset link.");
      return;
    }

    await supabase.auth.signOut();

    toast.success("Password updated. Sign in with your new password.");
    router.push("/login");
    router.refresh();
  }

  if (isCheckingSession) {
    return (
      <div className="glass-panel rounded-2xl p-8 shadow-cue-glow">
        <p className="text-sm text-charcoal-400 text-center">
          Checking your reset link...
        </p>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="glass-panel rounded-2xl p-8 shadow-cue-glow">
        <h2 className="text-xl font-semibold text-white mb-2">
          Reset link unavailable
        </h2>
        <p className="text-charcoal-400 text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>

        <Link
          href="/forgot-password"
          className="block text-center text-sm text-cue-blue-400 hover:text-cue-blue-300 font-medium transition-colors"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-cue-glow">
      <h2 className="text-xl font-semibold text-white mb-1">
        Choose a new password
      </h2>
      <p className="text-charcoal-400 text-sm mb-7">
        Enter a new password for your CUE account.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
            New password
          </label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-cue-blue-400 focus:border-transparent transition-colors"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-charcoal-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
            Confirm new password
          </label>

          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            minLength={8}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-cue-blue-400 focus:border-transparent transition-colors"
          />
        </div>

        <Button
          type="submit"
          variant="cue"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
        >
          Update password
        </Button>
      </form>
    </div>
  );
}
