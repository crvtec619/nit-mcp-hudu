import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  archiveAssetSchema,
  archiveArticleSchema,
  archiveWebsiteSchema,
} from "../../schemas/inputs";
import { assertWriteAllowed, type LocalEnv } from "../guards";
import { runWrite } from "./run-write";
import { formatArchiveResult } from "../formatters/markdown";

// Archive/unarchive are PUT /<resource-path>/{archive|unarchive} with no body and
// commonly an empty response. We confirm via the known id, not the response.
async function doArchive(
  env: LocalEnv,
  opts: {
    tool: string;
    label: string;
    basePath: string;
    company_id: number | undefined;
    id: number;
    archived: boolean;
  }
) {
  assertWriteAllowed(opts.company_id, env);
  await runWrite(
    env,
    {
      tool: opts.tool,
      method: "PUT",
      endpoint: `${opts.basePath}/${opts.archived ? "archive" : "unarchive"}`,
      company_id: opts.company_id,
      target_id: opts.id,
    },
    undefined,
    (r) => r
  );
  return {
    content: [
      { type: "text" as const, text: formatArchiveResult(opts.label, opts.id, opts.archived) },
    ],
  };
}

export function register(server: McpServer, env: LocalEnv) {
  // ---- Assets (company-scoped path) ----
  server.registerTool(
    "hudu_archive_asset",
    {
      description: "Archive an asset (reversible). Hides it from active views; restore with hudu_unarchive_asset.",
      inputSchema: archiveAssetSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    (args) =>
      doArchive(env, {
        tool: "hudu_archive_asset",
        label: "Asset",
        basePath: `companies/${args.company_id}/assets/${args.asset_id}`,
        company_id: args.company_id,
        id: args.asset_id,
        archived: true,
      })
  );

  server.registerTool(
    "hudu_unarchive_asset",
    {
      description: "Restore a previously archived asset.",
      inputSchema: archiveAssetSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    (args) =>
      doArchive(env, {
        tool: "hudu_unarchive_asset",
        label: "Asset",
        basePath: `companies/${args.company_id}/assets/${args.asset_id}`,
        company_id: args.company_id,
        id: args.asset_id,
        archived: false,
      })
  );

  // ---- Articles ----
  server.registerTool(
    "hudu_archive_article",
    {
      description: "Archive a KB article (reversible). Restore with hudu_unarchive_article.",
      inputSchema: archiveArticleSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    (args) =>
      doArchive(env, {
        tool: "hudu_archive_article",
        label: "Article",
        basePath: `articles/${args.article_id}`,
        company_id: args.company_id,
        id: args.article_id,
        archived: true,
      })
  );

  server.registerTool(
    "hudu_unarchive_article",
    {
      description: "Restore a previously archived KB article.",
      inputSchema: archiveArticleSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    (args) =>
      doArchive(env, {
        tool: "hudu_unarchive_article",
        label: "Article",
        basePath: `articles/${args.article_id}`,
        company_id: args.company_id,
        id: args.article_id,
        archived: false,
      })
  );

  // ---- Websites ----
  server.registerTool(
    "hudu_archive_website",
    {
      description: "Archive a website monitoring entry (reversible). Restore with hudu_unarchive_website.",
      inputSchema: archiveWebsiteSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true },
    },
    (args) =>
      doArchive(env, {
        tool: "hudu_archive_website",
        label: "Website",
        basePath: `websites/${args.website_id}`,
        company_id: args.company_id,
        id: args.website_id,
        archived: true,
      })
  );

  server.registerTool(
    "hudu_unarchive_website",
    {
      description: "Restore a previously archived website monitoring entry.",
      inputSchema: archiveWebsiteSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    (args) =>
      doArchive(env, {
        tool: "hudu_unarchive_website",
        label: "Website",
        basePath: `websites/${args.website_id}`,
        company_id: args.company_id,
        id: args.website_id,
        archived: false,
      })
  );
}
