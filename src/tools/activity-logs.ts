import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listActivityLogsSchema } from "../schemas/inputs";
import { huduFetchPaged } from "../api-client";
import { formatActivityLogList } from "../formatters/markdown";
import type { HuduActivityLog } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_activity_logs",
    {
      description:
        "List activity logs (audit trail) in Hudu. Filter by user_id, user_email, resource_type (e.g. 'Asset', 'Company', 'Article'), resource_id, action_message, or start_date. Useful for tracking changes and compliance auditing. Returns 25 per page.",
      inputSchema: listActivityLogsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduActivityLog>(
          env,
          "activity_logs",
          {
            user_id: args.user_id,
            user_email: args.user_email,
            resource_id: args.resource_id,
            resource_type: args.resource_type,
            action_message: args.action_message,
            start_date: args.start_date,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatActivityLogList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_activity_logs]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
