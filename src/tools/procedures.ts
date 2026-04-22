import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listProceduresSchema, getProcedureSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatProcedureList, formatProcedureDetail } from "../formatters/markdown";
import type { HuduProcedure } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_procedures",
    {
      description:
        "List procedures in Hudu. In the Hudu UI these are called 'Processes'. Filter by name or company_id. Returns 25 per page.",
      inputSchema: listProceduresSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduProcedure>(
          env,
          "procedures",
          {
            name: args.name,
            company_id: args.company_id,
            slug: args.slug,
            global_template: args.global_template,
            parent_procedure_id: args.parent_procedure_id,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatProcedureList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_procedures]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_procedure",
    {
      description:
        "Get a specific procedure by ID, including its description. In the Hudu UI these are called 'Processes'.",
      inputSchema: getProcedureSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ procedure: HuduProcedure }>(
          env,
          `procedures/${args.procedure_id}`
        );
        const procedure = raw.procedure ?? (raw as unknown as HuduProcedure);

        return {
          content: [{ type: "text" as const, text: formatProcedureDetail(procedure) }],
        };
      } catch (err) {
        console.error("[hudu_get_procedure]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
