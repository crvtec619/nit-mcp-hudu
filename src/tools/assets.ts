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
        "List assets in Hudu. Optionally filter by company_id (recommended for targeted lookups), asset_layout_id, or name. Without company_id, returns assets across all companies. Returns 25 results per page.",
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

        const params: Record<string, string | number | boolean | undefined> = {
          name: args.name,
          asset_layout_id: args.asset_layout_id,
          archived: args.archived,
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
