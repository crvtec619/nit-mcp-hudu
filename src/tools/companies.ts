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
        "Search and list companies in Hudu. Use 'search' for fuzzy keyword matching (e.g. 'Viking'), or filter by exact name, phone, website, city, state, slug, or integration ID. Returns 25 results per page by default.",
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
            search: args.search,
            name: args.name,
            phone_number: args.phone,
            website: args.website,
            city: args.city,
            state: args.state,
            slug: args.slug,
            id_number: args.id_number,
            id_in_integration: args.id_in_integration,
            updated_at: args.updated_at,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatCompanyList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_companies]", err instanceof Error ? err.message : String(err));
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
        console.error("[hudu_get_company]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
