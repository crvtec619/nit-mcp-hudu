import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAssetLayoutSchema, updateAssetLayoutSchema } from "../../schemas/inputs";
import type { HuduAssetLayout } from "../../types";
import type { LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatAssetLayoutWriteResult } from "../formatters/markdown";

const unwrapLayout = unwrap<HuduAssetLayout>("asset_layout");

// Field definitions are sent under `fields` (or `asset_layout_fields` in some
// Hudu versions). Verify the exact key against the in-instance Swagger.
function toFields(
  fields: {
    label: string;
    field_type: string;
    position?: number;
    required?: boolean;
    show_in_list?: boolean;
    hint?: string;
    options?: string;
    expiration?: boolean;
  }[]
): Record<string, unknown>[] {
  return fields.map((f, i) => ({
    label: f.label,
    field_type: f.field_type,
    position: f.position ?? i,
    required: f.required ?? false,
    show_in_list: f.show_in_list ?? false,
    hint: f.hint,
    options: f.options,
    expiration: f.expiration ?? false,
  }));
}

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_asset_layout",
    {
      description:
        "Create an asset layout (template) with field definitions. Asset layouts are global (not company-scoped). Use this to stand up a layout per the NIT Standard before creating assets.",
      inputSchema: createAssetLayoutSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const layout = await runWrite(
        env,
        { tool: "hudu_create_asset_layout", method: "POST", endpoint: "asset_layouts", name: args.name },
        {
          asset_layout: {
            name: args.name,
            icon: args.icon,
            color: args.color,
            icon_color: args.icon_color,
            include_passwords: args.include_passwords,
            include_photos: args.include_photos,
            include_comments: args.include_comments,
            include_files: args.include_files,
            fields: toFields(args.fields),
          },
        },
        unwrapLayout
      );
      return { content: [{ type: "text" as const, text: formatAssetLayoutWriteResult(layout, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_asset_layout",
    {
      description:
        "Update an asset layout. Provide only fields to change. NOTE: sending `fields` replaces the full field set, so include existing fields you want to keep (fetch them first with hudu_get_asset_layout).",
      inputSchema: updateAssetLayoutSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    async (args) => {
      const layout: Record<string, unknown> = {};
      if (args.name !== undefined) layout.name = args.name;
      if (args.icon !== undefined) layout.icon = args.icon;
      if (args.color !== undefined) layout.color = args.color;
      if (args.icon_color !== undefined) layout.icon_color = args.icon_color;
      if (args.active !== undefined) layout.active = args.active;
      if (args.fields !== undefined) layout.fields = toFields(args.fields);

      const updated = await runWrite(
        env,
        {
          tool: "hudu_update_asset_layout",
          method: "PUT",
          endpoint: `asset_layouts/${args.asset_layout_id}`,
          target_id: args.asset_layout_id,
          name: args.name,
        },
        { asset_layout: layout },
        unwrapLayout
      );
      return { content: [{ type: "text" as const, text: formatAssetLayoutWriteResult(updated, "updated") }] };
    }
  );
}
