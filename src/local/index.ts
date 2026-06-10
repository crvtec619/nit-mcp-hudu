import dotenv from "dotenv";
// quiet: true suppresses dotenv v17's stdout banner, which would otherwise
// corrupt the stdio JSON-RPC stream and break the MCP handshake.
dotenv.config({ path: ".env.local", quiet: true });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProfile, PROFILE_NAMES } from "./profiles";
import type { LocalEnv } from "./guards";

const required = ["HUDU_BASE_URL", "HUDU_API_KEY"] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}. Check your .env.local file.`);
    process.exit(1);
  }
}

const env = {
  HUDU_BASE_URL: process.env.HUDU_BASE_URL!,
  HUDU_API_KEY: process.env.HUDU_API_KEY!,
  HUDU_WRITE_ALLOWLIST: process.env.HUDU_WRITE_ALLOWLIST,
  HUDU_AUDIT_LOG: process.env.HUDU_AUDIT_LOG,
} as unknown as LocalEnv;

// Profile selects which read/write tools load. Each launcher (bin/hudu-*.sh)
// sets HUDU_PROFILE; unset means "all". Reads from the worker tree are gap-fill
// only (built-in Hudu MCP covers companies/assets/articles/etc.).
const profile = (process.env.HUDU_PROFILE || "all").trim();

const server = new McpServer({
  name: `hudu-mcp-local-${profile}`,
  version: "1.0.0",
});

try {
  registerProfile(server, env, profile);
} catch (err) {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}

const transport = new StdioServerTransport();
await server.connect(transport);

const allowlist = process.env.HUDU_WRITE_ALLOWLIST?.trim();
console.error(
  `[hudu-mcp-local] profile=${profile} (valid: ${PROFILE_NAMES.join(", ")}, all). ` +
    `Write scope: ${allowlist ? `companies ${allowlist}` : "all companies (no allowlist)"}.`
);
