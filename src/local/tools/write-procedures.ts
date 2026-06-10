import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  createProcedureSchema,
  updateProcedureSchema,
  createProcedureTaskSchema,
  updateProcedureTaskSchema,
} from "../../schemas/inputs";
import type { HuduProcedure, HuduProcedureTask } from "../../types";
import { assertWriteAllowed, type LocalEnv } from "../guards";
import { runWrite, unwrap } from "./run-write";
import {
  formatProcedureWriteResult,
  formatProcedureTaskWriteResult,
} from "../formatters/markdown";

const unwrapProcedure = unwrap<HuduProcedure>("procedure");
const unwrapTask = unwrap<HuduProcedureTask>("procedure_task");

function defined(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

export function register(server: McpServer, env: LocalEnv) {
  // ---- Procedures (Processes) ----
  server.registerTool(
    "hudu_create_procedure",
    {
      description: "Create a Procedure (Process / runbook template). Omit company_id for a global template.",
      inputSchema: createProcedureSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const procedure = await runWrite(
        env,
        { tool: "hudu_create_procedure", method: "POST", endpoint: "procedures", company_id: args.company_id, name: args.name },
        { procedure: defined({ name: args.name, company_id: args.company_id, description: args.description }) },
        unwrapProcedure
      );
      return { content: [{ type: "text" as const, text: formatProcedureWriteResult(procedure, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_procedure",
    {
      description: "Update a Procedure. Provide only the fields to change.",
      inputSchema: updateProcedureSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      assertWriteAllowed(args.company_id, env);
      const procedure = await runWrite(
        env,
        {
          tool: "hudu_update_procedure",
          method: "PUT",
          endpoint: `procedures/${args.procedure_id}`,
          company_id: args.company_id,
          target_id: args.procedure_id,
          name: args.name,
        },
        { procedure: defined({ name: args.name, description: args.description }) },
        unwrapProcedure
      );
      return { content: [{ type: "text" as const, text: formatProcedureWriteResult(procedure, "updated") }] };
    }
  );

  // ---- Procedure tasks ----
  server.registerTool(
    "hudu_create_procedure_task",
    {
      description: "Add a task to a Procedure.",
      inputSchema: createProcedureTaskSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const task = await runWrite(
        env,
        { tool: "hudu_create_procedure_task", method: "POST", endpoint: "procedure_tasks", name: args.name },
        {
          procedure_task: defined({
            procedure_id: args.procedure_id,
            name: args.name,
            description: args.description,
            position: args.position,
            priority: args.priority,
            due_date: args.due_date,
            optional: args.optional,
          }),
        },
        unwrapTask
      );
      return { content: [{ type: "text" as const, text: formatProcedureTaskWriteResult(task, "created") }] };
    }
  );

  server.registerTool(
    "hudu_update_procedure_task",
    {
      description: "Update a procedure task (rename, reorder, set priority/due date, mark complete). Provide only the fields to change.",
      inputSchema: updateProcedureTaskSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
    },
    async (args) => {
      const task = await runWrite(
        env,
        {
          tool: "hudu_update_procedure_task",
          method: "PUT",
          endpoint: `procedure_tasks/${args.procedure_task_id}`,
          target_id: args.procedure_task_id,
          name: args.name,
        },
        {
          procedure_task: defined({
            name: args.name,
            description: args.description,
            position: args.position,
            priority: args.priority,
            completed: args.completed,
            due_date: args.due_date,
            optional: args.optional,
          }),
        },
        unwrapTask
      );
      return { content: [{ type: "text" as const, text: formatProcedureTaskWriteResult(task, "updated") }] };
    }
  );
}
