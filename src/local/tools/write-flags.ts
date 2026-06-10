import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createFlagSchema, updateFlagSchema, deleteFlagSchema } from "../../schemas/inputs";
import type { HuduFlag } from "../../types";
import type { LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatFlagWriteResult, formatFlagDeleteResult } from "../formatters/markdown";

const unwrapFlag = unwrap<HuduFlag>("flag");

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_flag",
    {
      description:
        "Flag a record (Asset, Website, Article, Company, Procedure, Network, etc.) with a flag type. Use hudu_list_flag_types to find a flag_type_id.",
      inputSchema: createFlagSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const flag = await runWrite(
        env,
        { tool: "hudu_create_flag", method: "POST", endpoint: "flags", target_id: args.flagable_id },
        {
          flag: {
            flag_type_id: args.flag_type_id,
            flagable_type: args.flagable_type,
            flagable_id: args.flagable_id,
            description: args.description,
          },
        },
        unwrapFlag
      );
      return { content: [{ type: "text" as const, text: formatFlagWriteResult(flag) }] };
    }
  );

  server.registerTool(
    "hudu_update_flag",
    {
      description:
        "Update a flag on a record: change its flag type or description. Provide only the fields to change.",
      inputSchema: updateFlagSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const flag: Record<string, unknown> = {};
      if (args.flag_type_id !== undefined) flag.flag_type_id = args.flag_type_id;
      if (args.description !== undefined) flag.description = args.description;

      const updated = await runWrite(
        env,
        { tool: "hudu_update_flag", method: "PUT", endpoint: `flags/${args.flag_id}`, target_id: args.flag_id },
        { flag },
        unwrapFlag
      );
      return { content: [{ type: "text" as const, text: formatFlagWriteResult(updated) }] };
    }
  );

  server.registerTool(
    "hudu_delete_flag",
    {
      description:
        "Remove a flag by ID. This is the only delete tool in the connector; flags are lightweight and reversible (re-create with hudu_create_flag).",
      inputSchema: deleteFlagSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async (args) => {
      await runWrite(
        env,
        { tool: "hudu_delete_flag", method: "DELETE", endpoint: `flags/${args.flag_id}`, target_id: args.flag_id },
        undefined,
        (r) => r
      );
      return { content: [{ type: "text" as const, text: formatFlagDeleteResult(args.flag_id) }] };
    }
  );
}
