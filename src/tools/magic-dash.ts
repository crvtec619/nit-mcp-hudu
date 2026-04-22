import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listMagicDashSchema } from "../schemas/inputs";
import { huduFetch } from "../api-client";
import { formatMagicDashList } from "../formatters/markdown";
import type { HuduMagicDash } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_magic_dash",
    {
      description:
        "List Magic Dash widgets. Optionally filter by company_id or exact title. Returns a flat array (Hudu does not paginate this endpoint). Useful for checking what widgets already exist on a company before creating/updating one, since Magic Dash upserts by (title, company).",
      inputSchema: listMagicDashSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const widgets = await huduFetch<HuduMagicDash[]>(env, "magic_dash", {
          company_id: args.company_id,
          title: args.title,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: formatMagicDashList(Array.isArray(widgets) ? widgets : []),
            },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_list_magic_dash]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
