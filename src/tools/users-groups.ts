import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listUsersSchema, listGroupsSchema } from "../schemas/inputs";
import { huduFetchPaged } from "../api-client";
import { formatUserList, formatGroupList } from "../formatters/markdown";
import type { HuduUser, HuduGroup } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_users",
    {
      description:
        "List Hudu users (people with access to the Hudu instance). Returns 25 per page.",
      inputSchema: listUsersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduUser>(
          env,
          "users",
          {},
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatUserList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_users]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_list_groups",
    {
      description:
        "List groups in Hudu. Groups organize users for access control and permissions. Returns 25 per page.",
      inputSchema: listGroupsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduGroup>(
          env,
          "groups",
          {},
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatGroupList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_groups]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
