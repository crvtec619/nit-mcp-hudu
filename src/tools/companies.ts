import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listCompaniesSchema, getCompanySchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatCompanyList, formatCompanyDetail } from "../formatters/markdown";
import type { HuduCompany } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_companies",
    {
      description:
        "List companies in Hudu. Filter by name, phone, website, city, or state. Returns 25 results per page.",
      inputSchema: listCompaniesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduCompany>(
          env,
          "companies",
          {
            name: args.name,
            phone: args.phone,
            website: args.website,
            city: args.city,
            state: args.state,
            id_in_integration: args.id_in_integration,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatCompanyList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_companies]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_company",
    {
      description:
        "Get detailed information about a specific company in Hudu by ID, including address, phone, website, and notes.",
      inputSchema: getCompanySchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ company: HuduCompany }>(
          env,
          `companies/${args.company_id}`
        );
        const company = raw.company ?? (raw as unknown as HuduCompany);

        return {
          content: [{ type: "text" as const, text: formatCompanyDetail(company) }],
        };
      } catch (err) {
        console.error("[hudu_get_company]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
