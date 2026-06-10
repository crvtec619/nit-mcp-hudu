import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createFlagTypeSchema, updateFlagTypeSchema } from "../../schemas/inputs";
import type { HuduFlagType } from "../../types";
import type { LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatFlagTypeWriteResult } from "../formatters/markdown";

const unwrapFlagType = unwrap<HuduFlagType>("flag_type");

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_flag_type",
    {
      description:
        "Create a flag type (the reusable category behind flags, e.g. 'Outdated'). Use hudu_create_flag to apply a type to a record.",
      inputSchema: createFlagTypeSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const flagType = await runWrite(
        env,
        { tool: "hudu_create_flag_type", method: "POST", endpoint: "flag_types", name: args.name },
        { flag_type: { name: args.name, color: args.color } },
        unwrapFlagType
      );
      return { content: [{ type: "text" as const, text: formatFlagTypeWriteResult(flagType, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_flag_type",
    {
      description: "Update a flag type's name or color. Provide only the fields to change.",
      inputSchema: updateFlagTypeSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const flagType: Record<string, unknown> = {};
      if (args.name !== undefined) flagType.name = args.name;
      if (args.color !== undefined) flagType.color = args.color;

      const updated = await runWrite(
        env,
        { tool: "hudu_update_flag_type", method: "PUT", endpoint: `flag_types/${args.flag_type_id}`, target_id: args.flag_type_id, name: args.name },
        { flag_type: flagType },
        unwrapFlagType
      );
      return { content: [{ type: "text" as const, text: formatFlagTypeWriteResult(updated, "updated") }] };
    }
  );
}
