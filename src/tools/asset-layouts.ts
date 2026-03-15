import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listAssetLayoutsSchema, getAssetLayoutSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatAssetLayoutList, formatAssetLayoutDetail } from "../formatters/markdown";
import type { HuduAssetLayout } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_asset_layouts",
    {
      description:
        "List asset layouts (templates) in Hudu. Asset layouts define the fields and structure for assets. Filter by name. Returns 25 per page.",
      inputSchema: listAssetLayoutsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduAssetLayout>(
          env,
          "asset_layouts",
          {
            name: args.name,
            slug: args.slug,
            active: args.active,
            updated_at: args.updated_at,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatAssetLayoutList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_asset_layouts]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_asset_layout",
    {
      description:
        "Get a specific asset layout by ID, including all field definitions (label, type, required, position). Useful for understanding the structure before creating or querying assets.",
      inputSchema: getAssetLayoutSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ asset_layout: HuduAssetLayout }>(
          env,
          `asset_layouts/${args.layout_id}`
        );
        const layout = raw.asset_layout ?? (raw as unknown as HuduAssetLayout);

        return {
          content: [{ type: "text" as const, text: formatAssetLayoutDetail(layout) }],
        };
      } catch (err) {
        console.error("[hudu_get_asset_layout]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
