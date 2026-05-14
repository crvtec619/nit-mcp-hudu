import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  listUploadsSchema,
  listCardsSchema,
  listMatchersSchema,
} from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import {
  formatUploadList,
  formatCardList,
  formatMatcherList,
  formatAppInfo,
} from "../formatters/markdown";
import type {
  HuduUpload,
  HuduCard,
  HuduMatcher,
  HuduAppInfo,
} from "../types";

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
            archived: args.archived,
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
    "hudu_list_cards",
    {
      description:
        "List integration sync cards. Each card represents an external integrator's record (HaloPSA, ConnectWise, etc.) linked to a Hudu entity. Filter by integrator_name + sync_id to trace cross-system records.",
      inputSchema: listCardsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduCard>(
          env,
          "cards",
          {
            integrator_id: args.integrator_id,
            integrator_name: args.integrator_name,
            sync_id: args.sync_id,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatCardList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_cards]", err instanceof Error ? err.message : String(err));
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_list_matchers",
    {
      description:
        "List integration company matchers. Use matched=false to find unmatched external companies (PSA <-> Hudu linkage gaps).",
      inputSchema: listMatchersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduMatcher>(
          env,
          "matchers",
          {
            integrator_id: args.integrator_id,
            matched: args.matched,
            company_id: args.company_id,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatMatcherList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_matchers]", err instanceof Error ? err.message : String(err));
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
