import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createArticleSchema, updateArticleSchema } from "../../schemas/inputs";
import type { HuduArticle } from "../../types";
import { assertWriteAllowed, type LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatArticleWriteResult } from "../formatters/markdown";

const unwrapArticle = unwrap<HuduArticle>("article");

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_article",
    {
      description:
        "Create a KB article (Hudu API: Article; UI: KB Article). Accepts HTML content. Omit company_id for a global KB article.",
      inputSchema: createArticleSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const article = await runWrite(
        env,
        {
          tool: "hudu_create_article",
          method: "POST",
          endpoint: "articles",
          company_id: args.company_id,
          name: args.name,
        },
        {
          article: {
            name: args.name,
            content: args.content,
            company_id: args.company_id,
            folder_id: args.folder_id,
          },
        },
        unwrapArticle
      );
      return { content: [{ type: "text" as const, text: formatArticleWriteResult(article, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_article",
    {
      description:
        "Update an existing KB article. Provide only the fields to change.",
      inputSchema: updateArticleSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const article: Record<string, unknown> = {};
      if (args.name !== undefined) article.name = args.name;
      if (args.content !== undefined) article.content = args.content;
      if (args.folder_id !== undefined) article.folder_id = args.folder_id;

      const updated = await runWrite(
        env,
        {
          tool: "hudu_update_article",
          method: "PUT",
          endpoint: `articles/${args.article_id}`,
          target_id: args.article_id,
          name: args.name,
        },
        { article },
        unwrapArticle
      );
      return { content: [{ type: "text" as const, text: formatArticleWriteResult(updated, "updated") }] };
    }
  );
}
