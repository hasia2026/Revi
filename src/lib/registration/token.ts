import "server-only";
import { createHash, randomBytes } from "crypto";

/**
 * Registration token generation.
 *
 * The raw token is a bearer credential: whoever holds it can open a guest's
 * registration form without logging in. It is therefore generated here,
 * server-side, returned to the caller exactly once, and never persisted.
 * Only the SHA-256 hash reaches the database.
 *
 * The "server-only" import above is load-bearing. Importing this module from
 * a client component fails the build rather than shipping token generation
 * into the browser bundle.
 *
 * Do not log, cache, or store the raw token anywhere.
 */

/** 256 bits of entropy, base64url so it is URL-safe without escaping. */
const TOKEN_BYTES = 32;

export type RegistrationToken = {
  /** Show once, then discard. Never persist this. */
  raw: string;
  /** Lowercase SHA-256 hex — the only form the database sees. */
  hash: string;
};

export function generateRegistrationToken(): RegistrationToken {
  const raw = randomBytes(TOKEN_BYTES).toString("base64url");
  return { raw, hash: hashRegistrationToken(raw) };
}

/**
 * Also used on the public route to look up an incoming token. A fast hash is
 * correct here: SHA-256 is not chosen for password-style resistance but
 * because a 256-bit random value has nothing to brute force, and lookup runs
 * on every page load.
 */
export function hashRegistrationToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}
