import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createFolderSchema, updateFolderSchema } from "../../schemas/inputs";
import type { HuduFolder } from "../../types";
import { assertWriteAllowed, type LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import { formatFolderWriteResult } from "../formatters/markdown";

const unwrapFolder = unwrap<HuduFolder>("folder");

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_folder",
    {
      description:
        "Create a folder (KB/article folder). Omit company_id for a global folder; set parent_folder_id to nest under another folder.",
      inputSchema: createFolderSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const folder = await runWrite(
        env,
        { tool: "hudu_create_folder", method: "POST", endpoint: "folders", company_id: args.company_id, name: args.name },
        {
          folder: {
            name: args.name,
            company_id: args.company_id,
            parent_folder_id: args.parent_folder_id,
            icon: args.icon,
            description: args.description,
          },
        },
        unwrapFolder
      );
      return { content: [{ type: "text" as const, text: formatFolderWriteResult(folder, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_folder",
    {
      description:
        "Update or reparent a folder. To move it, set parent_folder_id (a folder ID to nest under, or null for top level). Provide only the fields to change.",
      inputSchema: updateFolderSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const folder: Record<string, unknown> = {};
      if (args.name !== undefined) folder.name = args.name;
      // parent_folder_id is explicitly nullable: null reparents to top level,
      // so include it whenever the caller provided the key (even as null).
      if (args.parent_folder_id !== undefined) folder.parent_folder_id = args.parent_folder_id;
      if (args.icon !== undefined) folder.icon = args.icon;
      if (args.description !== undefined) folder.description = args.description;

      const updated = await runWrite(
        env,
        {
          tool: "hudu_update_folder",
          method: "PUT",
          endpoint: `folders/${args.folder_id}`,
          company_id: args.company_id,
          target_id: args.folder_id,
          name: args.name,
        },
        { folder },
        unwrapFolder
      );
      return { content: [{ type: "text" as const, text: formatFolderWriteResult(updated, "updated") }] };
    }
  );
}
