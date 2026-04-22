import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAllTools } from "../tools/index";
import { register as registerWriteMagicDash } from "./tools/write-magic-dash";
import { register as registerWriteArticles } from "./tools/write-articles";
import type { LocalEnv } from "./tools/guards";

const required = ["HUDU_BASE_URL", "HUDU_API_KEY", "HUDU_TEST_COMPANY_ID"] as const;
for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}. Check your .env.local file.`);
    process.exit(1);
  }
}

const env = {
  HUDU_BASE_URL: process.env.HUDU_BASE_URL!,
  HUDU_API_KEY: process.env.HUDU_API_KEY!,
  HUDU_TEST_COMPANY_ID: process.env.HUDU_TEST_COMPANY_ID!,
} as unknown as LocalEnv;

const server = new McpServer({
  name: "hudu-mcp-local",
  version: "1.0.0",
});

// Read tools (reused from production)
registerAllTools(server, env);

// Write tools (local-dev only, sandbox-guarded)
registerWriteMagicDash(server, env);
registerWriteArticles(server, env);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error(
  `[hudu-mcp-local] MCP server running on stdio ` +
    `(sandbox company ${process.env.HUDU_TEST_COMPANY_ID})`
);
