import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listPasswordFoldersSchema } from "../schemas/inputs";
import { huduFetchPaged } from "../api-client";
import { formatPasswordFolderList } from "../formatters/markdown";
import type { HuduPasswordFolder } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_password_folders",
    {
      description:
        "List Hudu password folders (folder structure only, no credentials). Distinct from KB folders. Use this to verify the standard 9-folder taxonomy including the 'Regulated Systems' folder with restricted group access. The MCP's API key is provisioned without password read access, so asset_passwords list/get is intentionally not exposed.",
      inputSchema: listPasswordFoldersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const data = await huduFetchPaged<HuduPasswordFolder>(
          env,
          "password_folders",
          {
            company_id: args.company_id,
            name: args.name,
            page_size: args.page_size,
          },
          args.page
        );

        return {
          content: [{ type: "text" as const, text: formatPasswordFolderList(data) }],
        };
      } catch (err) {
        console.error(
          "[hudu_list_password_folders]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
