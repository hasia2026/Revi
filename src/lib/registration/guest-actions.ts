"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { hashRegistrationToken } from "./token";
import { isSupportedLocale } from "@/lib/i18n/locales";

const inputSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.string().trim().max(254),
  phone: z.string().trim().max(50),
  address: z.string().trim().max(500),
  locale: z.string(),
  consent: z.boolean().refine((value) => value, { message: "Consent is required" }),
  signatureName: z.string().trim().min(2).max(200),
});

export type GuestRegistrationInput = z.infer<typeof inputSchema>;

export type GuestRegistrationResult =
  | { ok: true }
  | { ok: false; error: string };

export async function submitGuestRegistration(
  token: string,
  input: GuestRegistrationInput,
): Promise<GuestRegistrationResult> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return { ok: false, error: "This registration link is invalid or no longer available." };
  }

  const parsed = inputSchema.safeParse(input);
  if (!parsed.success || !isSupportedLocale(parsed.data.locale)) {
    return { ok: false, error: "Please review the required information and try again." };
  }

  if (parsed.data.email && !z.string().email().safeParse(parsed.data.email).success) {
    return { ok: false, error: "Please enter a valid email address." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("submit_guest_registration", {
    p_token_hash: hashRegistrationToken(token),
    p_first_name: parsed.data.firstName,
    p_last_name: parsed.data.lastName,
    p_email: parsed.data.email || null,
    p_phone: parsed.data.phone || null,
    p_address: parsed.data.address || null,
    p_locale: parsed.data.locale,
    p_signature_name: parsed.data.signatureName,
    p_consent: parsed.data.consent,
  });

  if (error) {
    const known = new Set([
      "Registration link is invalid or no longer available",
      "Registration link has expired",
      "Registration has already been completed",
      "Guest record could not be found",
      "Consent and signature are required",
    ]);
    return {
      ok: false,
      error: known.has(error.message)
        ? error.message
        : "Registration could not be completed. Please ask the front desk for help.",
    };
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (result !== true && result?.success !== true) {
    return { ok: false, error: "Registration could not be completed. Please ask the front desk for help." };
  }

  return { ok: true };
}
