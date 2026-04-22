interface Env {
  OAUTH_KV: KVNamespace;
  OAUTH_PROVIDER: import("@cloudflare/workers-oauth-provider").OAuthHelpers;
  MCP_OBJECT: DurableObjectNamespace;
  HUDU_BASE_URL: string;
  HUDU_API_KEY: string;
  ENTRA_TENANT_ID: string;
  ENTRA_CLIENT_ID: string;
  ENTRA_CLIENT_SECRET: string;
  // Comma-separated list of emails allowed to invoke write tools.
  // Pushed as a Cloudflare secret via GitHub Actions.
  HUDU_WRITE_ALLOWLIST?: string;
  // Populated per-request in src/index.ts from ctx.props.email.
  // Write tools read this to enforce the allowlist.
  CALLER_EMAIL?: string;
}
