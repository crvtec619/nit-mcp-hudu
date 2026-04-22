/**
 * Shared gating helpers for production write tools.
 *
 * Writes are guarded by an email allowlist: the authenticated user's
 * email (from Entra via OAuth, surfaced on env.CALLER_EMAIL by
 * src/index.ts) must appear in env.HUDU_WRITE_ALLOWLIST (comma-separated).
 *
 * Audit logs hash the email with SHA-256 (first 16 hex chars) so Grafana
 * never sees raw PII but we can still correlate who-did-what.
 */

export type AllowlistResult =
  | { allowed: true; emailHash: string }
  | { allowed: false; reason: string; emailHashOrEmpty: string };

export async function hashEmail(email: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(email.toLowerCase().trim())
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

export async function checkAllowlist(env: Env): Promise<AllowlistResult> {
  const email = (env.CALLER_EMAIL ?? "").trim().toLowerCase();
  const raw = (env.HUDU_WRITE_ALLOWLIST ?? "").trim();

  if (!email) {
    // Caller is unauthenticated, or the OAuth flow did not set props.
    return {
      allowed: false,
      reason: "no-caller-email",
      emailHashOrEmpty: "",
    };
  }

  const emailHash = await hashEmail(email);

  if (!raw) {
    // Allowlist secret not set → default-deny.
    return { allowed: false, reason: "allowlist-empty", emailHashOrEmpty: emailHash };
  }

  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 0)
    .includes(email);

  if (!allowed) {
    return { allowed: false, reason: "not-in-allowlist", emailHashOrEmpty: emailHash };
  }

  return { allowed: true, emailHash };
}

export function restrictedResponse() {
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text:
          "This tool is restricted to named users. Contact " +
          "ddonalson@networkzit.com if you need access.",
      },
    ],
  };
}
