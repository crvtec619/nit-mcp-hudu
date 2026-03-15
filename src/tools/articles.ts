import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listArticlesSchema, getArticleSchema } from "../schemas/inputs";
import { huduFetch, huduFetchPaged } from "../api-client";
import { formatArticleList, formatArticleDetail } from "../formatters/markdown";
import type { HuduArticle } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_articles",
    {
      description:
        "List Knowledge Base articles in Hudu. Filter by name or company_id. Articles without a company_id are global KB entries. Returns 25 per page. Note: 'Articles' in the API correspond to 'Knowledge Base Articles' in the Hudu UI.",
      inputSchema: listArticlesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduArticle>(
          env,
          "articles",
          { name: args.name, company_id: args.company_id },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatArticleList(data) }],
        };
      } catch (err) {
        console.error("[hudu_list_articles]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_article",
    {
      description:
        "Get a specific Knowledge Base article by ID, including its full HTML content. Content is returned as cleaned text (HTML stripped).",
      inputSchema: getArticleSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ article: HuduArticle }>(
          env,
          `articles/${args.article_id}`
        );
        const article = raw.article ?? (raw as unknown as HuduArticle);

        return {
          content: [{ type: "text" as const, text: formatArticleDetail(article) }],
        };
      } catch (err) {
        console.error("[hudu_get_article]", err instanceof Error ? err.stack : err);
        throw err;
      }
    }
  );
}
