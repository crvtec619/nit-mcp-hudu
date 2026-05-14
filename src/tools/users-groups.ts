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
        "List Hudu users. Filter by first_name/last_name, search (across name), email, security_level ('super_admin', 'admin', 'spectator', 'editor', 'author', 'portal_member', 'portal_admin'), portal_member_company_id, or archived status. Returns 25 per page.",
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
          {
            first_name: args.first_name,
            last_name: args.last_name,
            search: args.search,
            email: args.email,
            security_level: args.security_level,
            portal_member_company_id: args.portal_member_company_id,
            archived: args.archived,
            page_size: args.page_size,
          },
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
        "List groups in Hudu. Groups organize users for access control and permissions. Filter by name, default-group status, or search across names. Returns 25 per page.",
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
          {
            name: args.name,
            default: args.default,
            search: args.search,
            page_size: args.page_size,
          },
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
