import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createNetworkSchema,
  updateNetworkSchema,
  createIpAddressSchema,
  updateIpAddressSchema,
  createVlanSchema,
  updateVlanSchema,
  createVlanZoneSchema,
  updateVlanZoneSchema,
} from "../../schemas/inputs";
import type { HuduNetwork, HuduIpAddress, HuduVlan, HuduVlanZone } from "../../types";
import { assertWriteAllowed, type LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import {
  formatNetworkWriteResult,
  formatIpAddressWriteResult,
  formatVlanWriteResult,
  formatVlanZoneWriteResult,
} from "../formatters/markdown";

const unwrapNetwork = unwrap<HuduNetwork>("network");
const unwrapIp = unwrap<HuduIpAddress>("ip_address");
const unwrapVlan = unwrap<HuduVlan>("vlan");
const unwrapZone = unwrap<HuduVlanZone>("vlan_zone");

// Endpoints and body wrappers below follow Hudu's usual convention but are not
// in public docs; verify each against the in-instance Swagger before live use.
function defined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export function register(server: McpServer, env: LocalEnv) {
  // ---- Networks ----
  server.registerTool(
    "hudu_create_network",
    {
      description: "Create a network (IPAM) record under a company. Address in CIDR notation.",
      inputSchema: createNetworkSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const network = await runWrite(
        env,
        { tool: "hudu_create_network", method: "POST", endpoint: "networks", company_id: args.company_id, name: args.name },
        {
          network: defined({
            company_id: args.company_id,
            name: args.name,
            address: args.address,
            network_type: args.network_type,
            description: args.description,
            notes: args.notes,
            vlan_id: args.vlan_id,
          }),
        },
        unwrapNetwork
      );
      return { content: [{ type: "text" as const, text: formatNetworkWriteResult(network, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_network",
    {
      description: "Update a network record. Provide only the fields to change.",
      inputSchema: updateNetworkSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const network = await runWrite(
        env,
        {
          tool: "hudu_update_network",
          method: "PUT",
          endpoint: `networks/${args.network_id}`,
          company_id: args.company_id,
          target_id: args.network_id,
          name: args.name,
        },
        {
          network: defined({
            name: args.name,
            address: args.address,
            network_type: args.network_type,
            description: args.description,
            notes: args.notes,
            vlan_id: args.vlan_id,
          }),
        },
        unwrapNetwork
      );
      return { content: [{ type: "text" as const, text: formatNetworkWriteResult(network, "updated") }] };
    }
  );

  // ---- IP Addresses ----
  server.registerTool(
    "hudu_create_ip_address",
    {
      description: "Create an IP address record under a company.",
      inputSchema: createIpAddressSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const ip = await runWrite(
        env,
        { tool: "hudu_create_ip_address", method: "POST", endpoint: "ip_addresses", company_id: args.company_id, name: args.address },
        {
          ip_address: defined({
            company_id: args.company_id,
            address: args.address,
            status: args.status,
            fqdn: args.fqdn,
            description: args.description,
            notes: args.notes,
            asset_id: args.asset_id,
          }),
        },
        unwrapIp
      );
      return { content: [{ type: "text" as const, text: formatIpAddressWriteResult(ip, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_ip_address",
    {
      description: "Update an IP address record. Provide only the fields to change.",
      inputSchema: updateIpAddressSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const ip = await runWrite(
        env,
        {
          tool: "hudu_update_ip_address",
          method: "PUT",
          endpoint: `ip_addresses/${args.ip_address_id}`,
          company_id: args.company_id,
          target_id: args.ip_address_id,
          name: args.address,
        },
        {
          ip_address: defined({
            address: args.address,
            status: args.status,
            fqdn: args.fqdn,
            description: args.description,
            notes: args.notes,
            asset_id: args.asset_id,
          }),
        },
        unwrapIp
      );
      return { content: [{ type: "text" as const, text: formatIpAddressWriteResult(ip, "updated") }] };
    }
  );

  // ---- VLANs ----
  server.registerTool(
    "hudu_create_vlan",
    {
      description: "Create a VLAN record under a company. vlan_id is the 802.1Q number (1-4094).",
      inputSchema: createVlanSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const vlan = await runWrite(
        env,
        { tool: "hudu_create_vlan", method: "POST", endpoint: "vlans", company_id: args.company_id, name: args.name },
        {
          vlan: defined({
            company_id: args.company_id,
            name: args.name,
            vlan_id: args.vlan_id,
            description: args.description,
            notes: args.notes,
            vlan_zone_id: args.vlan_zone_id,
          }),
        },
        unwrapVlan
      );
      return { content: [{ type: "text" as const, text: formatVlanWriteResult(vlan, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_vlan",
    {
      description: "Update a VLAN record. Provide only the fields to change.",
      inputSchema: updateVlanSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const vlan = await runWrite(
        env,
        {
          tool: "hudu_update_vlan",
          method: "PUT",
          endpoint: `vlans/${args.vlan_record_id}`,
          company_id: args.company_id,
          target_id: args.vlan_record_id,
          name: args.name,
        },
        {
          vlan: defined({
            name: args.name,
            vlan_id: args.vlan_id,
            description: args.description,
            notes: args.notes,
            vlan_zone_id: args.vlan_zone_id,
          }),
        },
        unwrapVlan
      );
      return { content: [{ type: "text" as const, text: formatVlanWriteResult(vlan, "updated") }] };
    }
  );

  // ---- VLAN Zones ----
  server.registerTool(
    "hudu_create_vlan_zone",
    {
      description: "Create a VLAN zone (logical grouping of VLANs) under a company.",
      inputSchema: createVlanZoneSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const zone = await runWrite(
        env,
        { tool: "hudu_create_vlan_zone", method: "POST", endpoint: "vlan_zones", company_id: args.company_id, name: args.name },
        {
          vlan_zone: defined({
            company_id: args.company_id,
            name: args.name,
            description: args.description,
            vlan_id_ranges: args.vlan_id_ranges,
          }),
        },
        unwrapZone
      );
      return { content: [{ type: "text" as const, text: formatVlanZoneWriteResult(zone, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_vlan_zone",
    {
      description: "Update a VLAN zone. Provide only the fields to change.",
      inputSchema: updateVlanZoneSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const zone = await runWrite(
        env,
        {
          tool: "hudu_update_vlan_zone",
          method: "PUT",
          endpoint: `vlan_zones/${args.vlan_zone_id}`,
          company_id: args.company_id,
          target_id: args.vlan_zone_id,
          name: args.name,
        },
        {
          vlan_zone: defined({
            name: args.name,
            description: args.description,
            vlan_id_ranges: args.vlan_id_ranges,
          }),
        },
        unwrapZone
      );
      return { content: [{ type: "text" as const, text: formatVlanZoneWriteResult(zone, "updated") }] };
    }
  );
}
