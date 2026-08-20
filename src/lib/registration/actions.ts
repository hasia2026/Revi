"use server";

import { createClient } from "@/lib/supabase/server";
import { generateRegistrationToken } from "./token";

/**
 * Create (or reissue) a registration link for a reservation.
 *
 * The raw token exists only in this function's return value. It is not
 * stored, not logged, and not recoverable — the database holds only its
 * SHA-256 hash. If the front desk loses the URL, the only remedy is
 * reissuing, which revokes the previous link.
 *
 * Every rule about who may do this and when lives in the RPC, not here:
 * membership, cancelled/checked-in state, and expiry are all enforced in
 * create_registration_link under the caller's own privileges (SECURITY
 * INVOKER), so RLS still applies.
 */

export type CreateLinkResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

function getSiteUrl(): string {
  const raw = process.env.SITE_URL;

  // Fail loudly. Guessing from request headers would silently produce links
  // on a Vercel deployment hostname, which a guest would receive by SMS.
  if (!raw) {
    throw new Error("SITE_URL is not configured");
  }

  return raw.replace(/\/+$/, "");
}

export async function createRegistrationLink(
  reservationId: string,
): Promise<CreateLinkResult> {
  let siteUrl: string;
  try {
    siteUrl = getSiteUrl();
  } catch {
    return { ok: false, error: "Registration links are not configured yet." };
  }

  const { raw, hash } = generateRegistrationToken();

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_registration_link", {
    p_reservation_id: reservationId,
    p_token_hash: hash,
  });

  if (error) {
    // The RPC's messages are written for the front desk; pass them through.
    return { ok: false, error: error.message };
  }

  const link = Array.isArray(data) ? data[0] : data;

  if (!link?.expires_at) {
    return { ok: false, error: "Link was created but could not be read back." };
  }

  // Never log this URL — it contains the bearer credential.
  return {
    ok: true,
    url: `${siteUrl}/register/${raw}`,
    expiresAt: link.expires_at,
  };
}
