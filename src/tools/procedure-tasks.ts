import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { listProcedureTasksSchema, getProcedureTaskSchema } from "../schemas/inputs";
import { huduFetch } from "../api-client";
import {
  formatProcedureTaskList,
  formatProcedureTaskDetail,
} from "../formatters/markdown";
import type { HuduProcedureTask } from "../types";

export function register(server: McpServer, env: Env) {
  server.registerTool(
    "hudu_list_procedure_tasks",
    {
      description:
        "List the individual tasks within a Hudu Process (template) or Run (active instance). Filter by procedure_id to see all tasks for one process/run, by name, or by company_id. Useful for tracking step-level completion in onboarding/offboarding workflows. Returns all matching tasks in one response.",
      inputSchema: listProcedureTasksSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ procedure_tasks: HuduProcedureTask[] } | HuduProcedureTask[]>(
          env,
          "procedure_tasks",
          {
            procedure_id: args.procedure_id,
            name: args.name,
            company_id: args.company_id,
          }
        );

        const records = Array.isArray(raw)
          ? raw
          : raw.procedure_tasks ?? [];

        return {
          content: [{ type: "text" as const, text: formatProcedureTaskList(records) }],
        };
      } catch (err) {
        console.error(
          "[hudu_list_procedure_tasks]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );

  server.registerTool(
    "hudu_get_procedure_task",
    {
      description:
        "Get a specific procedure task by ID, including completion status, assigned users, due date, and any subtask references.",
      inputSchema: getProcedureTaskSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        openWorldHint: true,
      },
    },
    async (args) => {
      try {
        const raw = await huduFetch<{ procedure_task: HuduProcedureTask }>(
          env,
          `procedure_tasks/${args.procedure_task_id}`
        );
        const task = raw.procedure_task ?? (raw as unknown as HuduProcedureTask);

        return {
          content: [{ type: "text" as const, text: formatProcedureTaskDetail(task) }],
        };
      } catch (err) {
        console.error(
          "[hudu_get_procedure_task]",
          err instanceof Error ? err.message : String(err)
        );
        throw err;
      }
    }
  );
}
