import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listWebsitesSchema, getWebsiteSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatWebsiteList, formatWebsiteDetail } from "../formatters/markdown";
import type { HuduWebsite } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_websites",
    {
      description:
        "Search and list monitored websites in Hudu. Use 'search' for fuzzy keyword matching, or filter by exact name. Hudu tracks DNS, SSL, and WHOIS monitoring for these sites.",
      inputSchema: listWebsitesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduWebsite>(
          env,
          "websites",
          {
            search: args.search,
            name: args.name,
            slug: args.slug,
            updated_at: args.updated_at,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatWebsiteList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_websites]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_website",
    {
      description:
        "Get detailed information about a specific monitored website in Hudu, including DNS, SSL, and WHOIS monitoring status.",
      inputSchema: getWebsiteSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ website: HuduWebsite }>(
          env,
          `websites/${args.website_id}`
        );
        const website = raw.website ?? (raw as unknown as HuduWebsite);

        return {
          content: [{ type: "text" as const, text: formatWebsiteDetail(website) }],
        };
      } catch (err) {
        console.error("[hudu_get_website]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
