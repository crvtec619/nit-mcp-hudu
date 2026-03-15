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

function getRequiredEnv(env: Bindings, key: keyof Bindings): string {
  const value = env[key];
  if (!value || typeof value !== "string") {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

// Health check
app.get("/", (c) => {
  return c.json({ server: "hudu-mcp", version: "1.0.0" });
});

// OAuth authorize: redirect user to Entra ID
app.get("/authorize", async (c) => {
  const tenantId = getRequiredEnv(c.env, "ENTRA_TENANT_ID");
  const clientId = getRequiredEnv(c.env, "ENTRA_CLIENT_ID");

  const oauthReqInfo = await c.env.OAUTH_PROVIDER.parseAuthRequest(c.req.raw);
  if (!oauthReqInfo.clientId) {
    return c.text("Invalid OAuth request", 400);
  }

  const nonce = crypto.randomUUID();
  const statePayload = JSON.stringify({ oauthReq: oauthReqInfo, nonce });
  const state = btoa(statePayload)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

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
    const desc = c.req.query("error_description") || error;
    return c.text(`Entra ID error: ${desc}`, 400);
  }

  if (!code || !stateParam) {
    return c.text("Missing code or state parameter", 400);
  }

  let statePayload: { oauthReq: AuthRequest; nonce: string };
  try {
    const raw = stateParam.replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw.padEnd(raw.length + (4 - (raw.length % 4)) % 4, "=");
    statePayload = JSON.parse(atob(padded));
  } catch {
    return c.text("Invalid state parameter", 400);
  }

  if (!statePayload.oauthReq || !statePayload.nonce) {
    return c.text("Malformed state payload", 400);
  }

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
    const text = await tokenResponse.text();
    console.error(`[auth] Token exchange failed (${tokenResponse.status}): ${text}`);
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
    const text = await graphResponse.text();
    console.error(`[auth] Graph API failed (${graphResponse.status}): ${text}`);
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
