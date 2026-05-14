import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listRacksSchema,
  getRackSchema,
  listRackStorageItemsSchema,
} from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import {
  formatRackList,
  formatRackDetail,
  formatRackStorageItemList,
} from "../formatters/markdown";
import type { HuduRack, HuduRackStorageItem } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_racks",
    {
      description:
        "List Hudu racks. Filter by company_id, location_id, or name. Useful for dispatch and physical infrastructure documentation (Viking, Tenvie, Gafcon).",
      inputSchema: listRacksSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduRack>(
          env,
          "racks",
          {
            company_id: args.company_id,
            location_id: args.location_id,
            name: args.name,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatRackList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_racks]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_rack",
    {
      description: "Get a specific Hudu rack by ID, including height, width, and unit numbering.",
      inputSchema: getRackSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ rack: HuduRack }>(env, `racks/${args.rack_id}`);
        const rack = raw.rack ?? (raw as unknown as HuduRack);

        return {
          content: [{ type: "text" as const, text: formatRackDetail(rack) }],
        };
      } catch (err) {
        console.error("[hudu_get_rack]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_list_rack_storage_items",
    {
      description:
        "List items mounted in racks. Filter by rack_storage_id (parent rack) or asset_id. Each item maps a rack unit position to an asset.",
      inputSchema: listRackStorageItemsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduRackStorageItem>(
          env,
          "rack_storage_items",
          {
            rack_storage_id: args.rack_storage_id,
            asset_id: args.asset_id,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatRackStorageItemList(data) }],
        };
      } catch (err) {
        console.error(
          "[hudu_list_rack_storage_items]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
