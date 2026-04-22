# Hudu MCP Server

An MCP (Model Context Protocol) server that gives AI assistants read access to the NetworkZ IT Hudu tenant. Runs on Cloudflare Workers with Microsoft Entra ID for user authentication.

Remote URL: `https://nit-mcp-hudu.nit-7ac.workers.dev/mcp`

## Architecture

- **Runtime:** Cloudflare Workers (stateless)
- **Transport:** MCP Streamable HTTP via `WebStandardStreamableHTTPServerTransport` (from the MCP TypeScript SDK)
- **OAuth provider:** `@cloudflare/workers-oauth-provider` handles MCP OAuth 2.1 with PKCE
- **User auth:** Microsoft Entra ID (tenant `6c9b4558-affd-4a18-9494-fb95f1ed92d1`) — users sign in with their NetworkZ account. State is HMAC-signed and the nonce is single-use via `OAUTH_KV` (10-minute TTL)
- **Hudu auth:** Static `x-api-key` header against `docs.networkzit.com/api/v1`
- **Routing:** Hono for `/`, `/authorize`, `/callback`; the OAuth provider routes `/mcp` to the MCP handler

There are no Durable Objects and no persistent per-user sessions. Each MCP request creates a fresh `McpServer` + transport, runs, and tears down.

## Tools exposed

All tools are read-only against Hudu:

- Companies: `hudu_list_companies`, `hudu_get_company`
- Assets: `hudu_list_assets`, `hudu_get_asset`
- Asset Layouts: `hudu_list_asset_layouts`, `hudu_get_asset_layout`
- Articles (KB): `hudu_list_articles`, `hudu_get_article`
- Procedures (Processes): `hudu_list_procedures`, `hudu_get_procedure`
- Websites: `hudu_list_websites`, `hudu_get_website`
- Expirations: `hudu_list_expirations`
- Folders: `hudu_list_folders`
- Users & Groups: `hudu_list_users`, `hudu_list_groups`
- Activity Logs: `hudu_list_activity_logs`
- Relations: `hudu_list_relations`

Hudu API quirks to note: `Article` = KB Article (in the UI); `Procedure` = Process (in the UI).

## Repository layout

```
src/
  index.ts             entry point — OAuthProvider + MCP transport
  auth-handler.ts      /authorize and /callback for Entra ID (HMAC state + KV nonce)
  api-client.ts        huduFetch, huduFetchPaged, huduFetchAll, huduMutate
  types.ts             Hudu response types
  tools/               one file per resource (companies, assets, articles, …)
  schemas/inputs.ts    Zod schemas for tool input validation
  formatters/markdown.ts  markdown table + detail view helpers
  local/               stdio entry + write tools (local-dev branch only)
.github/workflows/deploy.yml  CI: typecheck + build + audit, then deploy on main
wrangler.toml          Cloudflare Worker config
```

## Local development

Requires Node 22+.

```bash
npm ci
npm run dev        # wrangler dev on :8787
npm run typecheck
npm run build
```

Secrets are read from `.dev.vars` in development:

```
HUDU_API_KEY=...
ENTRA_CLIENT_ID=...
ENTRA_CLIENT_SECRET=...
```

Public config lives in `wrangler.toml` under `[vars]`.

## Deployment

Push to `main` → GitHub Actions runs the verify gate (typecheck + build + `npm audit --audit-level=moderate`), then `wrangler deploy`. Secrets are pushed to Cloudflare via `wrangler secret put` as part of the same workflow. Pull requests against `main` run the verify gate too but do not deploy.

Required GitHub repository secrets:
- `CLOUDFLARE_API_TOKEN`
- `HUDU_API_KEY`
- `ENTRA_CLIENT_ID`, `ENTRA_CLIENT_SECRET`

## Observability

Grafana traces and logs are enabled via `[observability]` in `wrangler.toml`. Both route to the Cloudflare-linked Grafana destinations (`grafana-traces`, `grafana-logs`). The API client logs only on error; per-request logs are intentionally off to keep signal high in Grafana.

## Phases

- **Phase 1 (current):** 17 read-only tools (companies, assets, articles, expirations, etc.)
- **Phase 2 (next):** Write tools (create/update assets, articles, Magic Dash)
- **Phase 3 (future):** Network documentation tools (IPs, networks, VLANs)

## Local dev (write tools)

The `local-dev` branch extends main with a stdio MCP server that exposes **write tools** (Magic Dash create/delete, Article create/update/archive/unarchive) for local experimentation. **It is never merged into `main`** — production remains read-only until specific writes are promoted through their own PRs.

```bash
git checkout local-dev
cp .env.local.example .env.local   # fill in HUDU_API_KEY and HUDU_TEST_COMPANY_ID
npm ci
npm run local
```

Register with Claude Code:

```bash
claude mcp add hudu-dev -- npm run local --prefix /home/wsldavid/projects/nit-mcp-hudu
```

### Sandbox guardrail

Every write tool on `local-dev` validates that the incoming `company_id` equals `HUDU_TEST_COMPANY_ID` (set in `.env.local`). Create a dedicated **"MCP Sandbox"** company in Hudu and point `HUDU_TEST_COMPANY_ID` at its numeric ID before running any writes. A mismatched company ID aborts the call with a descriptive error and never reaches the Hudu API.

### No-merge policy

`local-dev` is a long-lived branch. Do **not** open a PR that merges `local-dev` into `main`. To pick up new read tools or dep bumps from `main`, rebase `local-dev` on top of `main` locally and force-push. When a specific write graduates to production, it ships as a separate `feat/...` branch against `main` with its own gating (email allowlist).

## Sibling project

`halopsa-mcp-server` — HaloPSA MCP server, same architecture pattern.
