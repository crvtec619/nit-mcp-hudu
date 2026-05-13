interface Env {
  OAUTH_KV: KVNamespace;
  OAUTH_PROVIDER: import("@cloudflare/workers-oauth-provider").OAuthHelpers;
  MCP_OBJECT: DurableObjectNamespace;
  HUDU_BASE_URL: string;
  HUDU_API_KEY: string;
  ENTRA_TENANT_ID: string;
  ENTRA_CLIENT_ID: string;
  ENTRA_CLIENT_SECRET: string;
  PUBLIC_BASE_URL: string;
}
