import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listFlagsSchema,
  getFlagSchema,
  listFlagTypesSchema,
  getFlagTypeSchema,
} from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import {
  formatFlagList,
  formatFlagDetail,
  formatFlagTypeList,
  formatFlagTypeDetail,
} from "../formatters/markdown";
import type { HuduFlag, HuduFlagType } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_flags",
    {
      description:
        "List flags attached to Hudu records. Flagable types: Asset, Website, Article, AssetPassword, Company, Procedure, RackStorage, Network, IpAddress, Vlan, VlanZone. Use flag_type_id to filter by a specific flag category (see hudu_list_flag_types).",
      inputSchema: listFlagsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduFlag>(
          env,
          "flags",
          {
            flag_type_id: args.flag_type_id,
            flagable_type: args.flagable_type,
            flagable_id: args.flagable_id,
            description: args.description,
            created_at: args.created_at,
            updated_at: args.updated_at,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatFlagList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_flags]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_flag",
    {
      description: "Get a specific Hudu flag by ID, including the record it's attached to and its description.",
      inputSchema: getFlagSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ flag: HuduFlag }>(env, `flags/${args.flag_id}`);
        const flag = raw.flag ?? (raw as unknown as HuduFlag);

        return {
          content: [{ type: "text" as const, text: formatFlagDetail(flag) }],
        };
      } catch (err) {
        console.error("[hudu_get_flag]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_list_flag_types",
    {
      description:
        "List the configured flag categories (e.g. 'Inactive', 'Managed', 'Needs Review'). Each flag type has a name, color, and slug. Use this to discover available flag categories before filtering hudu_list_flags by flag_type_id.",
      inputSchema: listFlagTypesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduFlagType>(
          env,
          "flag_types",
          {
            name: args.name,
            color: args.color,
            slug: args.slug,
            created_at: args.created_at,
            updated_at: args.updated_at,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatFlagTypeList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_flag_types]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_flag_type",
    {
      description: "Get a specific Hudu flag type (category) by ID, including its display color.",
      inputSchema: getFlagTypeSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ flag_type: HuduFlagType }>(
          env,
          `flag_types/${args.flag_type_id}`
        );
        const flagType = raw.flag_type ?? (raw as unknown as HuduFlagType);

        return {
          content: [{ type: "text" as const, text: formatFlagTypeDetail(flagType) }],
        };
      } catch (err) {
        console.error("[hudu_get_flag_type]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
