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
        "List procedures in Hudu. The API returns both 'processes' (templates) and 'runs' (active instances created via kickoff). Use type='process'/'run'/'all', process_scope='global'/'company' for scope. parent_process_id filters runs by parent process. Returns 25 per page. (In the Hudu UI 'procedure' = 'Process'.)",
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
            type: args.type,
            process_scope: args.process_scope,
            parent_process_id: args.parent_process_id ?? args.parent_procedure_id,
            global_template: args.global_template,
            archived: args.archived,
            created_at: args.created_at,
            updated_at: args.updated_at,
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
