import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createMagicDashSchema, deleteMagicDashSchema } from "../schemas/inputs";
import { huduFetch, huduMutate } from "../../api-client";
import { formatMagicDashResult, formatMagicDashDeleteResult } from "../formatters/markdown";
import type { HuduCompany, HuduMagicDash } from "../../types";
import { assertSandboxCompany, type LocalEnv } from "./guards";

// Hudu's POST /magic_dash requires company_name (not company_id) in the body.
// We accept company_id on the public schema to stay consistent with every
// other tool and look up the name here.
async function lookupCompanyName(env: LocalEnv, companyId: number): Promise<string> {
  const raw = await huduFetch<{ company: HuduCompany } | HuduCompany>(
    env,
    `companies/${companyId}`
  );
  const company = (raw as { company?: HuduCompany }).company ?? (raw as HuduCompany);
  if (!company?.name) {
    throw new Error(`Hudu company ${companyId} has no name; cannot POST magic_dash.`);
  }
  return company.name;
}

export function register(server: McpServer, env: LocalEnv) {
  server.registerTool(
    "hudu_create_magic_dash",
    {
      description:
        "Create or update a Magic Dash widget on a company's page in Hudu. Upserts by (title, company_name) — reusing a title replaces the existing widget's body. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: createMagicDashSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        const companyName = await lookupCompanyName(env, args.company_id);

        const body: Record<string, unknown> = {
          title: args.title,
          company_name: companyName,
          message: args.message,
        };
        if (args.shade !== undefined) body.shade = args.shade;
        if (args.icon !== undefined) body.icon = args.icon;
        if (args.content_link !== undefined) body.content_link = args.content_link;
        if (args.content !== undefined) body.content = args.content;
        if (args.image_url !== undefined) body.image_url = args.image_url;

        const result = await huduMutate<HuduMagicDash>(env, "POST", "magic_dash", body);

        return {
          content: [
            { type: "text" as const, text: formatMagicDashResult(result) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_create_magic_dash]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_delete_magic_dash",
    {
      description:
        "Delete a Magic Dash widget by ID. Local-dev only: company_id must equal HUDU_TEST_COMPANY_ID.",
      inputSchema: deleteMagicDashSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        assertSandboxCompany(args.company_id, env);

        await huduMutate<null>(env, "DELETE", `magic_dash/${args.id}`);

        return {
          content: [
            { type: "text" as const, text: formatMagicDashDeleteResult(args.id) },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_delete_magic_dash]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
