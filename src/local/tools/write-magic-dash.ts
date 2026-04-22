import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMagicDashSchema, deleteMagicDashSchema } from "../schemas/inputs";
import { huduMutate } from "../../api-client";
import { formatMagicDashResult, formatMagicDashDeleteResult } from "../formatters/markdown";
import type { HuduMagicDash } from "../../types";
import { assertSandboxCompany, type LocalEnv } from "./guards";

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_magic_dash",
    {
      description:
        "Create or update a Magic Dash widget on a company's page in Hudu. Upserts by (title, company_id) — reusing a title replaces the existing widget's body. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: createMagicDashSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        const body: Record<string, unknown> = {
          title: args.title,
          company_id: args.company_id,
          message: args.message,
        };
        if (args.shade !== undefined) body.shade = args.shade;
        if (args.icon !== undefined) body.icon = args.icon;
        if (args.content_link !== undefined) body.content_link = args.content_link;

        const result = await huduMutate<HuduMagicDash>(env, "POST", "magic_dash", body);

        return {
          content: [
            { type: "text" as const, text: formatMagicDashResult(result) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_create_magic_dash]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_delete_magic_dash",
    {
      description:
        "Delete a Magic Dash widget by ID. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: deleteMagicDashSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        await huduMutate<null>(env, "DELETE", `magic_dash/${args.id}`);

        return {
          content: [
            { type: "text" as const, text: formatMagicDashDeleteResult(args.id) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_delete_magic_dash]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
