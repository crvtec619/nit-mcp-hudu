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
import { register as registerMagicDash } from "./magic-dash";
import { register as registerLists } from "./lists";
import { register as registerNetworks } from "./networks";
import { register as registerPasswordFolders } from "./password-folders";
import { register as registerIntegrations } from "./integrations";
import { register as registerFlags } from "./flags";
import { register as registerVlans } from "./vlans";
import { register as registerProcedureTasks } from "./procedure-tasks";

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
  registerMagicDash(server, env); // read-only: hudu_list_magic_dash

  // Phase 1.5: Gap-driven read-only adds (Lists/IPAM/Password Folders + diag).
  // Racks/cards/matchers were probed and dropped: /racks 404, /cards 404,
  // /matchers 500 (verified 2026-05-13). rack_storage_items works but is
  // orphaned without /racks. See PR description for the smoke-test matrix.
  registerLists(server, env);
  registerNetworks(server, env);
  registerPasswordFolders(server, env);
  registerIntegrations(server, env);

  // Phase 1.6: Flags, VLANs (+ Zones), Procedure Tasks. Sourced from the
  // canonical Hudu swagger (2.41.2). See PR description for filter-enhancement
  // changes to folders, procedures, users, groups, articles, lists.
  registerFlags(server, env);
  registerVlans(server, env);
  registerProcedureTasks(server, env);

  // Phase 2: Write tools (create/update assets & articles, magic dash writes on local-dev)
}
