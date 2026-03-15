import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listAssetsSchema, getAssetSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatAssetList, formatAssetDetail } from "../formatters/markdown";
import type { HuduAsset } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_assets",
    {
      description:
        "Search and list assets in Hudu. Use 'search' for fuzzy keyword matching, or filter by exact name, company_id, asset_layout_id, serial number, etc. With company_id, uses the company-scoped endpoint (limited filters). Without company_id, uses the global endpoint (all filters available).",
      inputSchema: listAssetsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        // Use company-scoped endpoint when company_id is provided
        const endpoint = args.company_id
          ? `companies/${args.company_id}/assets`
          : "assets";

        // Company-scoped endpoint has limited filtering (archived, page_size only)
        // Global endpoint supports search, name, serial, layout, slug, updated_at
        const params: Record<string, string | number | boolean | undefined> = args.company_id
          ? {
              archived: args.archived,
              page_size: args.page_size,
            }
          : {
              search: args.search,
              name: args.name,
              primary_serial: args.primary_serial,
              asset_layout_id: args.asset_layout_id,
              archived: args.archived,
              slug: args.slug,
              updated_at: args.updated_at,
              page_size: args.page_size,
            };

        const data = await huduFetchPaged<HuduAsset>(
          env,
          endpoint,
          params,
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatAssetList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_assets]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_asset",
    {
      description:
        "Get detailed information about a specific asset in Hudu, including all custom fields. Requires both company_id and asset_id (assets are company-scoped in Hudu).",
      inputSchema: getAssetSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ asset: HuduAsset }>(
          env,
          `companies/${args.company_id}/assets/${args.asset_id}`
        );
        const asset = raw.asset ?? (raw as unknown as HuduAsset);

        return {
          content: [{ type: "text" as const, text: formatAssetDetail(asset) }],
        };
      } catch (err) {
        console.error("[hudu_get_asset]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
