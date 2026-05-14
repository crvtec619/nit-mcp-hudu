import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listNetworksSchema,
  getNetworkSchema,
  listIpAddressesSchema,
  getIpAddressSchema,
} from "../schemas/inputs";
import { huduFetch } from "../api-client";
import {
  formatNetworkList,
  formatNetworkDetail,
  formatIpAddressList,
  formatIpAddressDetail,
} from "../formatters/markdown";
import type { HuduNetwork, HuduIpAddress } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_networks",
    {
      description:
        "List Hudu networks (subnets, DHCP/DNS/gateway documentation). Filter by company_id. Returns all networks in one response (this endpoint does not paginate). Useful for clients with on-prem infrastructure (Viking, Tenvie).",
      inputSchema: listNetworksSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const records = await huduFetch<HuduNetwork[]>(env, "networks", {
          company_id: args.company_id,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: formatNetworkList(Array.isArray(records) ? records : []),
            },
          ],
        };
      } catch (err) {
        console.error("[hudu_list_networks]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_network",
    {
      description:
        "Get a specific Hudu network by ID, including address, network_type (numeric enum), VLAN, role/status list-item references, and notes.",
      inputSchema: getNetworkSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const network = await huduFetch<HuduNetwork>(env, `networks/${args.network_id}`);

        return {
          content: [{ type: "text" as const, text: formatNetworkDetail(network) }],
        };
      } catch (err) {
        console.error("[hudu_get_network]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_list_ip_addresses",
    {
      description:
        "List Hudu IPAM IP address records. Filter by company_id, network_id, address, or status. Returns all matching records in one response (this endpoint does not paginate). Use this for structured IP-to-device tracking.",
      inputSchema: listIpAddressesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const records = await huduFetch<HuduIpAddress[]>(env, "ip_addresses", {
          company_id: args.company_id,
          network_id: args.network_id,
          address: args.address,
          status: args.status,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: formatIpAddressList(Array.isArray(records) ? records : []),
            },
          ],
        };
      } catch (err) {
        console.error("[hudu_list_ip_addresses]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_ip_address",
    {
      description: "Get a specific Hudu IP address record by ID, including status, linked asset, and FQDN.",
      inputSchema: getIpAddressSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const ip = await huduFetch<HuduIpAddress>(env, `ip_addresses/${args.ip_address_id}`);

        return {
          content: [{ type: "text" as const, text: formatIpAddressDetail(ip) }],
        };
      } catch (err) {
        console.error("[hudu_get_ip_address]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
