import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMagicDashSchema } from "../../schemas/inputs";
import type { HuduMagicDash } from "../../types";
import type { LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatMagicDashWriteResult } from "../formatters/markdown";

const unwrapMagicDash = unwrap<HuduMagicDash>("magic_dash");

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_magic_dash",
    {
      description:
        "Create or update a Magic Dash widget on a company's page. Upserts by (title, company_name): reusing a title replaces that widget's body. POST /magic_dash takes company_name (not company_id). Note: the HUDU_WRITE_ALLOWLIST guard cannot apply here because this endpoint is name-scoped, not id-scoped.",
      inputSchema: createMagicDashSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const body: Record<string, unknown> = { title: args.title };
      if (args.company_name !== undefined) body.company_name = args.company_name;
      if (args.message !== undefined) body.message = args.message;
      if (args.icon !== undefined) body.icon = args.icon;
      if (args.image_url !== undefined) body.image_url = args.image_url;
      if (args.content_link !== undefined) body.content_link = args.content_link;
      if (args.content !== undefined) body.content = args.content;
      if (args.shade !== undefined) body.shade = args.shade;

      const result = await runWrite(
        env,
        { tool: "hudu_create_magic_dash", method: "POST", endpoint: "magic_dash", name: args.title },
        body,
        unwrapMagicDash
      );
      return { content: [{ type: "text" as const, text: formatMagicDashWriteResult(result) }] };
    }
  );
}
