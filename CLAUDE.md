# nit-mcp-hudu

Hudu MCP Server for Cloudflare Workers. Part of Networkz IT's integration platform.

## Architecture
- Cloudflare Workers (stateless) using `WebStandardStreamableHTTPServerTransport` from the MCP TypeScript SDK
- Entra ID OAuth for MCP client authentication; state is HMAC-signed and nonce-validated via OAUTH_KV
- Hudu REST API with x-api-key header auth
- Hono for `/`, `/authorize`, `/callback` routing; Zod for input validation

## Key Files
- `src/index.ts` - Entry point, OAuthProvider + per-request McpServer/transport
- `src/auth-handler.ts` - Entra ID OAuth flow with dynamic localhost/prod URL detection and KV nonce validation
- `src/api-client.ts` - Hudu API client (huduFetch, huduFetchPaged, huduFetchAll)
- `src/types.ts` - Hudu entity interfaces
- `src/schemas/inputs.ts` - Zod input schemas for all tools
- `src/formatters/markdown.ts` - Markdown table formatters
- `src/tools/` - One file per resource, each exports a register() function

## Hudu API Details
- Base URL: https://docs.networkzit.com/api/v1
- Auth: x-api-key header (stored as HUDU_API_KEY secret)
- Rate limit: 300 req/min
- Pagination: 25 per page, ?page=X (1-indexed)
- No public API docs. Swagger only accessible from within the Hudu instance.
- API naming differs from UI: Article = KB Article, Procedure = Process

## Commands
- `npm run dev` - Local dev with wrangler
- `npm run build` - TypeScript compilation
- `npm run deploy` - Deploy to Cloudflare
- `npm run typecheck` - Type check without emit
- `npm run local` - Run the local stdio write connector via tsx (reads `.env.local`)
- `npm run typecheck:local` - Type check the local connector tree (`tsconfig.local.json`)

## Local write connector (`src/local/`)
- Stdio MCP server for create/edit against Hudu, launched from Windows via WSL. The
  Cloudflare worker (`src/index.ts`, OAuth/Entra) is retired in favor of Hudu's built-in
  MCP for reads; this connector covers writes and is never deployed to the worker.
- Reuses the worker's read tools, `huduMutate`, formatters, types, and schemas. Write
  tools live under `src/local/tools/`; no delete tools by design.
- Safety: every write is appended to a JSONL audit log (`HUDU_AUDIT_LOG`, default
  `./audit/hudu-writes.jsonl`); optional `HUDU_WRITE_ALLOWLIST` (company IDs) restricts
  company-scoped writes. Write endpoints/body shapes are unverified (no public API docs);
  confirm against the in-instance Swagger.

## Phases
- Phase 1: read-only tools on the worker (companies, assets, articles, expirations, etc.)
- Phase 2: write tools delivered via the local connector (`src/local/`), not the worker

## Sibling Project
- `nit-mcp-halo-proj01` - HaloPSA MCP server, same architecture pattern

## Standards
- NIT integration standards: `_Standards/standard-configs/nit-integration-standards.md`
- Hudu API reference: `_Standards/standard-configs/hudu-api-integration.md`
