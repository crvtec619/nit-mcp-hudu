import { appendFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { LocalEnv } from "./guards";

const DEFAULT_LOG = "./audit/hudu-writes.jsonl";

export interface AuditEntry {
  tool: string;
  method: "POST" | "PUT" | "DELETE";
  endpoint: string;
  company_id?: number;
  target_id?: number;
  name?: string;
  ok: boolean;
  status?: string;
  error?: string;
}

/**
 * Append one JSON line per write to the audit log. Never logs request bodies,
 * so password or other secret field values are not persisted. Audit failures
 * are logged to stderr but never block or mask the underlying write result.
 */
export function auditWrite(env: LocalEnv, entry: AuditEntry): void {
  const path = resolve(env.HUDU_AUDIT_LOG?.trim() || DEFAULT_LOG);
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n";
  try {
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, line, "utf8");
  } catch (err) {
    console.error(
      "[audit] failed to write audit log:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
