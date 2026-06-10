import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAssetSchema, updateAssetSchema } from "../../schemas/inputs";
import type { HuduAsset } from "../../types";
import { assertWriteAllowed, type LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatAssetWriteResult } from "../formatters/markdown";

const unwrapAsset = unwrap<HuduAsset>("asset");

// Hudu wraps the asset payload under an `asset` key and expects custom field
// values as an array of single-key objects keyed by the field label. Verify
// against the in-instance Swagger before relying on this in production.
function toCustomFields(
  fields?: { label: string; value: string | number | boolean }[]
): Record<string, string | number | boolean>[] | undefined {
  if (!fields?.length) return undefined;
  return fields.map((f) => ({ [f.label]: f.value }));
}

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_asset",
    {
      description:
        "Create an asset under a company using a given asset layout. Custom field values must use labels that exactly match the layout's field labels (use hudu_get_asset_layout to check).",
      inputSchema: createAssetSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const asset = await runWrite(
        env,
        {
          tool: "hudu_create_asset",
          method: "POST",
          endpoint: `companies/${args.company_id}/assets`,
          company_id: args.company_id,
          name: args.name,
        },
        {
          asset: {
            name: args.name,
            asset_layout_id: args.asset_layout_id,
            primary_serial: args.primary_serial,
            primary_model: args.primary_model,
            primary_manufacturer: args.primary_manufacturer,
            custom_fields: toCustomFields(args.custom_fields),
          },
        },
        unwrapAsset
      );
      return { content: [{ type: "text" as const, text: formatAssetWriteResult(asset, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_asset",
    {
      description:
        "Update an existing asset. Provide only the fields to change. Custom field labels must match the layout exactly.",
      inputSchema: updateAssetSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const asset: Record<string, unknown> = {};
      if (args.name !== undefined) asset.name = args.name;
      if (args.primary_serial !== undefined) asset.primary_serial = args.primary_serial;
      if (args.primary_model !== undefined) asset.primary_model = args.primary_model;
      if (args.primary_manufacturer !== undefined) asset.primary_manufacturer = args.primary_manufacturer;
      const cf = toCustomFields(args.custom_fields);
      if (cf !== undefined) asset.custom_fields = cf;

      const updated = await runWrite(
        env,
        {
          tool: "hudu_update_asset",
          method: "PUT",
          endpoint: `companies/${args.company_id}/assets/${args.asset_id}`,
          company_id: args.company_id,
          target_id: args.asset_id,
          name: args.name,
        },
        { asset },
        unwrapAsset
      );
      return { content: [{ type: "text" as const, text: formatAssetWriteResult(updated, "updated") }] };
    }
  );
}
