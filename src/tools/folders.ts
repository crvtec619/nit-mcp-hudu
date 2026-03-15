import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listFoldersSchema } from "../schemas/inputs";
import { huduFetchPaged } from "../api-client";
import { formatFolderList } from "../formatters/markdown";
import type { HuduFolder } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_folders",
    {
      description:
        "List folders in Hudu. Filter by company_id. Folders organize Knowledge Base articles and other content. Returns 25 per page.",
      inputSchema: listFoldersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduFolder>(
          env,
          "folders",
          {
            name: args.name,
            company_id: args.company_id,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatFolderList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_folders]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
