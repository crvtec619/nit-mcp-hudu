import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listVlansSchema,
  getVlanSchema,
  listVlanZonesSchema,
  getVlanZoneSchema,
} from "../schemas/inputs";
import { huduFetch } from "../api-client";
import {
  formatVlanList,
  formatVlanDetail,
  formatVlanZoneList,
  formatVlanZoneDetail,
} from "../formatters/markdown";
import type { HuduVlan, HuduVlanZone } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_vlans",
    {
      description:
        "List Hudu VLANs. Filter by company_id, vlan_zone_id, exact name, or numeric vlan_id (1-4094). Returns all matching VLANs in one response (this endpoint does not paginate). Pairs with hudu_list_networks for full IPAM coverage.",
      inputSchema: listVlansSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const records = await huduFetch<HuduVlan[]>(env, "vlans", {
          company_id: args.company_id,
          vlan_zone_id: args.vlan_zone_id,
          name: args.name,
          vlan_id: args.vlan_id,
          archived: args.archived,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: formatVlanList(Array.isArray(records) ? records : []),
            },
          ],
        };
      } catch (err) {
        console.error("[hudu_list_vlans]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_vlan",
    {
      description: "Get a specific Hudu VLAN by ID, including its numeric VLAN tag, zone, and status/role list-item references.",
      inputSchema: getVlanSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const vlan = await huduFetch<HuduVlan>(env, `vlans/${args.vlan_id}`);

        return {
          content: [{ type: "text" as const, text: formatVlanDetail(vlan) }],
        };
      } catch (err) {
        console.error("[hudu_get_vlan]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_list_vlan_zones",
    {
      description:
        "List VLAN Zones (logical groupings of VLANs, e.g. by datacenter or building). Filter by company_id or name. Returns all matching zones in one response (no pagination).",
      inputSchema: listVlanZonesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const records = await huduFetch<HuduVlanZone[]>(env, "vlan_zones", {
          company_id: args.company_id,
          name: args.name,
          archived: args.archived,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: formatVlanZoneList(Array.isArray(records) ? records : []),
            },
          ],
        };
      } catch (err) {
        console.error("[hudu_list_vlan_zones]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_vlan_zone",
    {
      description: "Get a specific VLAN Zone by ID, including its VLAN ID ranges and assigned VLAN count.",
      inputSchema: getVlanZoneSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const zone = await huduFetch<HuduVlanZone>(env, `vlan_zones/${args.vlan_zone_id}`);

        return {
          content: [{ type: "text" as const, text: formatVlanZoneDetail(zone) }],
        };
      } catch (err) {
        console.error("[hudu_get_vlan_zone]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
