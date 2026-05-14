import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { listUploadsSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatUploadList, formatAppInfo } from "../formatters/markdown";
import type { HuduUpload, HuduAppInfo } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_uploads",
    {
      description:
        "List file uploads (attachments) in Hudu. Filter by uploadable_type + uploadable_id to find attachments on a specific record. Useful for audit evidence collection (Part 11, GxP).",
      inputSchema: listUploadsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduUpload>(
          env,
          "uploads",
          {
            uploadable_type: args.uploadable_type,
            uploadable_id: args.uploadable_id,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatUploadList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_uploads]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_api_info",
    {
      description: "Return Hudu API version and build info. Useful as a health/diagnostic probe.",
      inputSchema: z.object({}).shape,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async () => {
      try {
        const info = await huduFetch<HuduAppInfo>(env, "api_info");

        return {
          content: [{ type: "text" as const, text: formatAppInfo(info) }],
        };
      } catch (err) {
        console.error("[hudu_get_api_info]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );
}
