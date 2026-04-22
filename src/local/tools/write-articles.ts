import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createArticleSchema,
  updateArticleSchema,
  articleIdSchema,
} from "../schemas/inputs";
import { huduMutate } from "../../api-client";
import {
  formatArticleCreateResult,
  formatArticleUpdateResult,
  formatArticleArchiveResult,
  formatArticleDeleteResult,
} from "../formatters/markdown";
import type { HuduArticle } from "../../types";
import { assertSandboxCompany, type LocalEnv } from "./guards";

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_article",
    {
      description:
        "Create a KB article (Hudu calls them Articles; UI says KB Articles) under a company. Accepts HTML content. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: createArticleSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        const body: Record<string, unknown> = {
          name: args.name,
          content: args.content,
          company_id: args.company_id,
          enable_sharing: args.enable_sharing,
        };
        if (args.folder_id !== undefined) body.folder_id = args.folder_id;

        const result = await huduMutate<{ article: HuduArticle } | HuduArticle>(
          env,
          "POST",
          "articles",
          { article: body }
        );
        const article = (result as { article?: HuduArticle }).article ?? (result as HuduArticle);

        return {
          content: [
            { type: "text" as const, text: formatArticleCreateResult(article) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_create_article]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_update_article",
    {
      description:
        "Update an existing KB article's fields. Provide only the fields you want to change. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: updateArticleSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        const body: Record<string, unknown> = {};
        if (args.name !== undefined) body.name = args.name;
        if (args.content !== undefined) body.content = args.content;
        if (args.enable_sharing !== undefined) body.enable_sharing = args.enable_sharing;
        if (args.folder_id !== undefined) body.folder_id = args.folder_id;

        const result = await huduMutate<{ article: HuduArticle } | HuduArticle>(
          env,
          "PUT",
          `articles/${args.id}`,
          { article: body }
        );
        const article = (result as { article?: HuduArticle }).article ?? (result as HuduArticle);

        return {
          content: [
            { type: "text" as const, text: formatArticleUpdateResult(article) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_update_article]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_archive_article",
    {
      description:
        "Archive a KB article (reversible — use hudu_unarchive_article to restore). Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: articleIdSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        await huduMutate<null>(env, "PUT", `articles/${args.id}/archive`);

        return {
          content: [
            { type: "text" as const, text: formatArticleArchiveResult(args.id, true) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_archive_article]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_unarchive_article",
    {
      description:
        "Unarchive a previously archived KB article. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: articleIdSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        await huduMutate<null>(env, "PUT", `articles/${args.id}/unarchive`);

        return {
          content: [
            { type: "text" as const, text: formatArticleArchiveResult(args.id, false) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_unarchive_article]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_delete_article",
    {
      description:
        "Permanently delete a KB article by ID. Unlike archive (reversible), delete is final. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID. Requires DELETE permissions on the Hudu API key.",
      inputSchema: articleIdSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        await huduMutate<null>(env, "DELETE", `articles/${args.id}`);

        return {
          content: [
            { type: "text" as const, text: formatArticleDeleteResult(args.id) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_delete_article]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
