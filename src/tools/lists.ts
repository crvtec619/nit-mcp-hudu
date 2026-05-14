import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listListsSchema, getListSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatListList, formatListDetail } from "../formatters/markdown";
import type { HuduList } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_lists",
    {
      description:
        "List Hudu Admin > Lists. These provide the option sets for ListSelect layout fields. Use 'query' for partial-match search, 'name' for exact match. Use this to verify a list exists before referencing it from a layout (e.g. before the Dropdown -> ListSelect migration).",
      inputSchema: listListsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduList>(
          env,
          "lists",
          {
            query: args.query,
            name: args.name,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatListList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_lists]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_list",
    {
      description:
        "Get a specific Hudu list by ID, including its options (the values shown in ListSelect fields).",
      inputSchema: getListSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const list = await huduFetch<HuduList>(env, `lists/${args.list_id}`);

        return {
          content: [{ type: "text" as const, text: formatListDetail(list) }],
        };
      } catch (err) {
        console.error("[hudu_get_list]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
