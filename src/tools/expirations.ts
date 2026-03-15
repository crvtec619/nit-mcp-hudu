import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listExpirationsSchema } from "../schemas/inputs";
import { huduFetchPaged } from "../api-client";
import { formatExpirationList } from "../formatters/markdown";
import type { HuduExpiration } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_expirations",
    {
      description:
        "List expirations tracked in Hudu (SSL certificates, domain renewals, warranties, etc.). Filter by company_id or expiration_type. Useful for QBR reporting and proactive renewal tracking. Returns 25 per page.",
      inputSchema: listExpirationsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduExpiration>(
          env,
          "expirations",
          {
            company_id: args.company_id,
            expiration_type: args.expiration_type,
            resource_id: args.resource_id,
            resource_type: args.resource_type,
            archived: args.archived,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatExpirationList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_expirations]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
