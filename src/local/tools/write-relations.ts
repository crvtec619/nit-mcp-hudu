import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createRelationSchema } from "../../schemas/inputs";
import type { HuduRelation } from "../../types";
import type { LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatRelationWriteResult } from "../formatters/markdown";

const unwrapRelation = unwrap<HuduRelation>("relation");

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_relation",
    {
      description:
        "Link two Hudu records (e.g. relate an Asset to a Website). Provide the source (fromable) and target (toable) entity types and IDs.",
      inputSchema: createRelationSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const relation = await runWrite(
        env,
        { tool: "hudu_create_relation", method: "POST", endpoint: "relations" },
        {
          relation: {
            fromable_type: args.fromable_type,
            fromable_id: args.fromable_id,
            toable_type: args.toable_type,
            toable_id: args.toable_id,
            description: args.description,
          },
        },
        unwrapRelation
      );
      return { content: [{ type: "text" as const, text: formatRelationWriteResult(relation) }] };
    }
  );
}
