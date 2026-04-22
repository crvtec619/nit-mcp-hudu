import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listMagicDashSchema, createMagicDashSchema } from "../schemas/inputs";
import { huduFetch, huduMutate } from "../api-client";
import { formatMagicDashList, formatMagicDashResult } from "../formatters/markdown";
import type { HuduCompany, HuduMagicDash } from "../types";
import { checkAllowlist, restrictedResponse } from "../write-gate";

async function lookupCompanyName(env: Env, companyId: number): Promise<string> {
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

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_magic_dash",
    {
      description:
        "List Magic Dash widgets. Optionally filter by company_id or exact title. Returns a flat array (Hudu does not paginate this endpoint). Useful for checking what widgets already exist on a company before creating/updating one, since Magic Dash upserts by (title, company).",
      inputSchema: listMagicDashSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const widgets = await huduFetch<HuduMagicDash[]>(env, "magic_dash", {
          company_id: args.company_id,
          title: args.title,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: formatMagicDashList(Array.isArray(widgets) ? widgets : []),
            },
          ],
        };
      } catch (err) {
        console.error(
          "[hudu_list_magic_dash]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_create_magic_dash",
    {
      description:
        "Create or update a Magic Dash widget on a company's page. Upserts by (title, company_id) — reusing a title replaces the existing widget's body. RESTRICTED: only emails in HUDU_WRITE_ALLOWLIST can invoke this tool. Unauthorized calls are rejected without reaching the Hudu API.",
      inputSchema: createMagicDashSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const gate = await checkAllowlist(env);
        if (!gate.allowed) {
          console.error(
            `[hudu_create_magic_dash] rejected reason=${gate.reason} email=${gate.emailHashOrEmpty || "<none>"}`
          );
          return restrictedResponse();
        }

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

        console.error(
          `[hudu_create_magic_dash] ok email=${gate.emailHash} company=${args.company_id} title="${args.title.slice(0, 50)}" id=${result?.id}`
        );

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
}
