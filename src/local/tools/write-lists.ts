import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createListSchema, updateListSchema } from "../../schemas/inputs";
import type { HuduList } from "../../types";
import type { LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatListWriteResult } from "../formatters/markdown";

const unwrapList = unwrap<HuduList>("list");

// Hudu manages list items via nested attributes. The exact key
// (list_items_attributes) is unverified; confirm against the in-instance Swagger.
function toListItems(items?: string[]): { name: string }[] | undefined {
  if (!items?.length) return undefined;
  return items.map((name) => ({ name }));
}

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_list",
    {
      description:
        "Create a Hudu List. Lists supply the options for ListSelect asset-layout fields. Provide item names to seed the selectable options.",
      inputSchema: createListSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const list = await runWrite(
        env,
        { tool: "hudu_create_list", method: "POST", endpoint: "lists", name: args.name },
        {
          list: {
            name: args.name,
            description: args.description,
            list_items_attributes: toListItems(args.items),
          },
        },
        unwrapList
      );
      return { content: [{ type: "text" as const, text: formatListWriteResult(list, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_list",
    {
      description:
        "Update a Hudu List. NOTE: sending `items` replaces the full item set, so include existing item names you want to keep (fetch them first with hudu_get_list).",
      inputSchema: updateListSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async (args) => {
      const list: Record<string, unknown> = {};
      if (args.name !== undefined) list.name = args.name;
      if (args.description !== undefined) list.description = args.description;
      if (args.items !== undefined) list.list_items_attributes = toListItems(args.items);

      const updated = await runWrite(
        env,
        { tool: "hudu_update_list", method: "PUT", endpoint: `lists/${args.list_id}`, target_id: args.list_id, name: args.name },
        { list },
        unwrapList
      );
      return { content: [{ type: "text" as const, text: formatListWriteResult(updated, "updated") }] };
    }
  );
}
