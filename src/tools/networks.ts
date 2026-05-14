import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  listNetworksSchema,
  getNetworkSchema,
  listIpAddressesSchema,
  getIpAddressSchema,
} from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
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
        "List Hudu networks (subnets, DHCP/DNS/gateway documentation). Filter by company_id. Complements the Networks asset layout for clients with on-prem infrastructure (Viking, Tenvie).",
      inputSchema: listNetworksSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduNetwork>(
          env,
          "networks",
          {
            company_id: args.company_id,
            name: args.name,
            address: args.address,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatNetworkList(data) }],
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
      description: "Get a specific Hudu network by ID, including address, CIDR, and description.",
      inputSchema: getNetworkSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ network: HuduNetwork }>(
          env,
          `networks/${args.network_id}`
        );
        const network = raw.network ?? (raw as unknown as HuduNetwork);

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
        "List Hudu IPAM IP address records. Filter by company_id, network_id, address, status, or FQDN. Use this for structured IP-to-device tracking that the Networks asset layout doesn't provide.",
      inputSchema: listIpAddressesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduIpAddress>(
          env,
          "ip_addresses",
          {
            company_id: args.company_id,
            network_id: args.network_id,
            address: args.address,
            status: args.status,
            fqdn: args.fqdn,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatIpAddressList(data) }],
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
      description: "Get a specific Hudu IP address record by ID, including status, FQDN, and NAT mapping.",
      inputSchema: getIpAddressSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ ip_address: HuduIpAddress }>(
          env,
          `ip_addresses/${args.ip_address_id}`
        );
        const ip = raw.ip_address ?? (raw as unknown as HuduIpAddress);

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
