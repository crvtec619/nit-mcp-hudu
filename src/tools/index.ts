import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { register as registerCompanies } from "./companies";
import { register as registerAssets } from "./assets";
import { register as registerAssetLayouts } from "./asset-layouts";
import { register as registerArticles } from "./articles";
import { register as registerExpirations } from "./expirations";
import { register as registerWebsites } from "./websites";
import { register as registerProcedures } from "./procedures";
import { register as registerActivityLogs } from "./activity-logs";
import { register as registerFolders } from "./folders";
import { register as registerUsersGroups } from "./users-groups";
import { register as registerRelations } from "./relations";

export function registerAllTools(server: McpServer, env: Env) {
  // Phase 1: Read-only tools for QBR automation and cross-reference
  registerCompanies(server, env);
  registerAssets(server, env);
  registerAssetLayouts(server, env);
  registerArticles(server, env);
  registerExpirations(server, env);
  registerWebsites(server, env);
  registerProcedures(server, env);
  registerActivityLogs(server, env);
  registerFolders(server, env);
  registerUsersGroups(server, env);
  registerRelations(server, env);

  // Phase 2: Write tools (magic-dash.ts, create/update assets & articles)
  // Phase 3: Networks (networks.ts)
}
