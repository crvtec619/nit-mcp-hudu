import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { LocalEnv } from "./guards";

// Each profile bundles reads for every entity it can write, so you can find the
// IDs to edit without depending on another connector. (The built-in Hudu MCP can
// also read these, but we don't assume it is connected.)
import { register as readCompanies } from "../tools/companies";
import { register as readAssets } from "../tools/assets";
import { register as readArticles } from "../tools/articles";
import { register as readAssetLayouts } from "../tools/asset-layouts";
import { register as readLists } from "../tools/lists";
import { register as readFolders } from "../tools/folders";
import { register as readProcedures } from "../tools/procedures";
import { register as readProcedureTasks } from "../tools/procedure-tasks";
import { register as readNetworks } from "../tools/networks";
import { register as readVlans } from "../tools/vlans";
import { register as readRelations } from "../tools/relations";
import { register as readMagicDash } from "../tools/magic-dash";
import { register as readFlags } from "../tools/flags";
import { register as readWebsites } from "../tools/websites";

// Write modules.
import { register as writeAssets } from "./tools/write-assets";
import { register as writeAssetLayouts } from "./tools/write-asset-layouts";
import { register as writeArticles } from "./tools/write-articles";
import { register as writeFolders } from "./tools/write-folders";
import { register as writeNetworks } from "./tools/write-networks";
import { register as writeMagicDash } from "./tools/write-magic-dash";
import { register as writeRelations } from "./tools/write-relations";
import { register as writeLists } from "./tools/write-lists";
import { register as writeFlags } from "./tools/write-flags";
import { register as writeFlagTypes } from "./tools/write-flag-types";
import { register as writeArchive } from "./tools/write-archive";
import { register as writeProcedures } from "./tools/write-procedures";

type Reg = (server: McpServer, env: LocalEnv) => void;

// Lifecycle profiles. build = stand up the structure; data = feed data into it;
// ops = lean steady-state edits. `all` is the union (power use / back-compat).
const PROFILES: Record<string, { reads: Reg[]; writes: Reg[] }> = {
  build: {
    reads: [readCompanies, readAssetLayouts, readLists, readFolders, readProcedures, readProcedureTasks, readFlags],
    writes: [writeAssetLayouts, writeLists, writeFolders, writeProcedures, writeFlagTypes],
  },
  data: {
    reads: [readCompanies, readAssetLayouts, readAssets, readArticles, readFolders, readNetworks, readVlans, readRelations, readMagicDash],
    writes: [writeAssets, writeArticles, writeNetworks, writeRelations, writeMagicDash],
  },
  ops: {
    reads: [readCompanies, readAssets, readArticles, readFolders, readWebsites, readFlags],
    writes: [writeAssets, writeArticles, writeArchive, writeFlags, writeFlagTypes],
  },
};

export const PROFILE_NAMES = Object.keys(PROFILES);

export function registerProfile(server: McpServer, env: LocalEnv, profile: string): void {
  const fns = new Set<Reg>();
  if (profile === "all") {
    for (const p of Object.values(PROFILES)) {
      p.reads.forEach((r) => fns.add(r));
      p.writes.forEach((w) => fns.add(w));
    }
  } else {
    const def = PROFILES[profile];
    if (!def) {
      throw new Error(
        `Unknown HUDU_PROFILE "${profile}". Valid: ${PROFILE_NAMES.join(", ")}, all.`
      );
    }
    def.reads.forEach((r) => fns.add(r));
    def.writes.forEach((w) => fns.add(w));
  }
  fns.forEach((fn) => fn(server, env));
}
