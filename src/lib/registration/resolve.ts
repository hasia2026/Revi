import "server-only";
import { createAnonClient } from "@/lib/supabase/anon";
import { hashRegistrationToken } from "./token";

export type ResolvedRegistration =
  | {
      status: "valid";
      guestFirstName: string | null;
      guestLastInitial: string | null;
      propertyName: string | null;
      arrivalDate: string | null;
      departureDate: string | null;
      expiresAt: string | null;
      preferredLanguage: string | null;
    }
  | { status: "expired" | "completed" | "invalid" };

type ResolverRow = {
  status: string | null;
  guest_first_name: string | null;
  guest_last_initial: string | null;
  property_name: string | null;
  arrival_date: string | null;
  departure_date: string | null;
  expires_at: string | null;
  preferred_language: string | null;
};

const RAW_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const INVALID = { status: "invalid" } as const;

export async function resolveRegistrationToken(
  rawToken: string,
): Promise<ResolvedRegistration> {
  if (typeof rawToken !== "string" || !RAW_TOKEN_PATTERN.test(rawToken)) {
    return INVALID;
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.rpc("resolve_registration_link", {
    p_token_hash: hashRegistrationToken(rawToken),
  });

  if (error) {
    console.error("resolve_registration_link failed:", error.message);
    return INVALID;
  }

  const row = (Array.isArray(data) ? data[0] : data) as ResolverRow | null;
  if (!row) return INVALID;

  switch (row.status) {
    case "valid":
      return {
        status: "valid",
        guestFirstName: row.guest_first_name,
        guestLastInitial: row.guest_last_initial,
        propertyName: row.property_name,
        arrivalDate: row.arrival_date,
        departureDate: row.departure_date,
        expiresAt: row.expires_at,
        preferredLanguage: row.preferred_language,
      };
    case "expired":
      return { status: "expired" };
    case "completed":
      return { status: "completed" };
    default:
      return INVALID;
  }
}