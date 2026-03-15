import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listRelationsSchema } from "../schemas/inputs";
import { huduFetchPaged } from "../api-client";
import { formatRelationList } from "../formatters/markdown";
import type { HuduRelation } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_relations",
    {
      description:
        "List relations between objects in Hudu. Relations link entities together (e.g. an Asset to a Website, or a Company to another Company). Returns 25 per page.",
      inputSchema: listRelationsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduRelation>(
          env,
          "relations",
          { page_size: args.page_size },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatRelationList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_relations]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
