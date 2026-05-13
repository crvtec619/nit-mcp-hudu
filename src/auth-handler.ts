import type { AuthRequest, OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { Hono } from "hono";

const PROD_URL = "https://nit-mcp-hudu.nit-7ac.workers.dev";

function getWorkerUrl(req: Request): string {
  const url = new URL(req.url);
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    return `${url.protocol}//${url.host}`;
  }
  return PROD_URL;
}

type Bindings = Env & { OAUTH_PROVIDER: OAuthHelpers };

const app = new Hono<{ Bindings: Bindings }>();

const NONCE_TTL_SECONDS = 600;

function nonceKey(nonce: string): string {
  return `oauth:nonce:${nonce}`;
}

function getRequiredEnv(env: Bindings, key: keyof Bindings): string {
  const value = env[key];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

// ---- HMAC helpers for signing OAuth state (CSRF protection) ----

function toBase64Url(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const raw = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = raw.padEnd(raw.length + (4 - (raw.length % 4)) % 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Sign the state payload with HMAC-SHA256 and return "payload.signature".
 * Prevents CSRF by ensuring the callback state was issued by this worker.
 */
async function signState(payload: string, secret: string): Promise<string> {
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload));
  const key = await getHmacKey(secret);
  const sig = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64))
  );
  return `${payloadB64}.${toBase64Url(sig)}`;
}

/**
 * Verify and decode the signed state. Returns null if signature is invalid.
 */
async function verifyState(state: string, secret: string): Promise<string | null> {
  const dotIdx = state.lastIndexOf(".");
  if (dotIdx === -1) return null;

  const payloadB64 = state.slice(0, dotIdx);
  const sigB64 = state.slice(dotIdx + 1);

  const key = await getHmacKey(secret);
  const sigBytes = fromBase64Url(sigB64);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes,
    new TextEncoder().encode(payloadB64)
  );

  if (!valid) return null;

  return new TextDecoder().decode(fromBase64Url(payloadB64));
}

// Stable health endpoint for uptime probes; intentionally exempt from WAF
// country/bot rules so external monitors in any geo can reach it.
app.get("/healthz", (c) => {
  return c.json({ server: "hudu-mcp", version: "1.0.0", status: "ok" });
});

// Root: minimal landing; avoids leaking version info to unauthenticated callers.
app.get("/", (c) => {
  return c.text("OK", 200);
});

// OAuth authorize: redirect user to Entra ID
app.get("/authorize", async (c) => {
  const tenantId = getRequiredEnv(c.env, "ENTRA_TENANT_ID");
  const clientId = getRequiredEnv(c.env, "ENTRA_CLIENT_ID");
  const clientSecret = getRequiredEnv(c.env, "ENTRA_CLIENT_SECRET");

  const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
  if (!oauthReqInfo.clientId) {
    return c.text("Invalid OAuth request", 400);
  }

  const nonce = crypto.randomUUID();
  await c.env.OAUTH_KV.put(nonceKey(nonce), "1", { expirationTtl: NONCE_TTL_SECONDS });

  const statePayload = JSON.stringify({ oauthReq: oauthReqInfo, nonce });
  const state = await signState(statePayload, clientSecret);

  const entraAuthorizeUrl = new URL(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
  );
  entraAuthorizeUrl.searchParams.set("client_id", clientId);
  entraAuthorizeUrl.searchParams.set("response_type", "code");
  const workerUrl = getWorkerUrl(c.req.raw);
  entraAuthorizeUrl.searchParams.set("redirect_uri", `${workerUrl}/callback`);
  entraAuthorizeUrl.searchParams.set("scope", "openid email profile User.Read");
  entraAuthorizeUrl.searchParams.set("state", state);
  entraAuthorizeUrl.searchParams.set("response_mode", "query");

  return c.redirect(entraAuthorizeUrl.toString(), 302);
});

// OAuth callback: exchange code, get user info, complete MCP authorization
app.get("/callback", async (c) => {
  const tenantId = getRequiredEnv(c.env, "ENTRA_TENANT_ID");
  const clientId = getRequiredEnv(c.env, "ENTRA_CLIENT_ID");
  const clientSecret = getRequiredEnv(c.env, "ENTRA_CLIENT_SECRET");

  const code = c.req.query("code");
  const stateParam = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    // Do not reflect Entra ID error_description to the user (info disclosure)
    console.error(`[auth] Entra ID returned error: ${error}`);
    return c.text("Authentication failed. Please try again or contact your administrator.", 400);
  }

  if (!code || !stateParam) {
    return c.text("Missing code or state parameter", 400);
  }

  // Verify HMAC signature on state to prevent CSRF / state tampering
  const rawPayload = await verifyState(stateParam, clientSecret);
  if (!rawPayload) {
    console.error("[auth] State HMAC verification failed — possible CSRF attempt");
    return c.text("Invalid or tampered state parameter", 400);
  }

  let statePayload: { oauthReq: AuthRequest; nonce: string };
  try {
    statePayload = JSON.parse(rawPayload);
  } catch {
    return c.text("Invalid state parameter", 400);
  }

  if (!statePayload.oauthReq || !statePayload.nonce) {
    return c.text("Malformed state payload", 400);
  }

  // Verify the nonce against KV (prevents replay of captured state blobs).
  // Atomic check-and-delete: any second callback with the same nonce fails.
  const storedKey = nonceKey(statePayload.nonce);
  const stored = await c.env.OAUTH_KV.get(storedKey);
  if (!stored) {
    console.error("[auth] nonce rejected: not found or expired");
    return c.text("Invalid or expired authentication request", 400);
  }
  await c.env.OAUTH_KV.delete(storedKey);

  // Exchange authorization code for tokens at Entra
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: `${getWorkerUrl(c.req.raw)}/callback`,
    grant_type: "authorization_code",
  });

  const tokenResponse = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: tokenBody.toString(),
  });

  if (!tokenResponse.ok) {
    // Log status only — do not log response body (may contain tokens or secrets)
    console.error(`[auth] Token exchange failed (${tokenResponse.status})`);
    return c.text("Authentication failed. Please try again or contact your administrator.", 502);
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    id_token?: string;
  };

  // Fetch user profile from Microsoft Graph
  const graphResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!graphResponse.ok) {
    console.error(`[auth] Graph API failed (${graphResponse.status})`);
    return c.text("Failed to retrieve user profile. Please try again or contact your administrator.", 502);
  }

  const user = (await graphResponse.json()) as {
    id: string;
    displayName: string;
    mail: string | null;
    userPrincipalName: string;
  };

  const email = user.mail || user.userPrincipalName;

  // Complete the MCP OAuth flow
  const { redirectTo } = await c.env.OAUTH_PROVIDER.completeAuthorization({
    request: statePayload.oauthReq,
    userId: user.userPrincipalName,
    metadata: { label: user.displayName },
    scope: statePayload.oauthReq.scope,
    props: {
      email,
      name: user.displayName,
      entraId: user.id,
    },
  });

  return c.redirect(redirectTo, 302);
});

export { app as AuthHandler };
