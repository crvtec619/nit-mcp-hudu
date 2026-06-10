import { huduMutate } from "../../api-client";
import { auditWrite } from "../audit";
import type { LocalEnv } from "../guards";

export interface WriteMeta {
  tool: string;
  method: "POST" | "PUT" | "DELETE";
  endpoint: string;
  company_id?: number;
  target_id?: number;
  name?: string;
}

/**
 * Returns an unwrap function for Hudu responses that wrap the entity under a
 * top-level key (e.g. { asset: {...} }), falling back to the bare object.
 */
export function unwrap<T>(key: string): (raw: unknown) => T {
  return (raw) => {
    if (raw && typeof raw === "object" && key in raw) {
      return (raw as Record<string, T>)[key];
    }
    return raw as T;
  };
}

/**
 * Run a single write through huduMutate, record it to the audit log (success or
 * failure), and return the unwrapped entity. Audit target_id falls back to the
 * created entity's id when not known up front (e.g. on create).
 */
export async function runWrite<T>(
  env: LocalEnv,
  meta: WriteMeta,
  body: Record<string, unknown> | undefined,
  unwrapFn: (raw: unknown) => T
): Promise<T> {
  try {
    const raw = await huduMutate<unknown>(env, meta.method, meta.endpoint, body);
    const result = unwrapFn(raw);
    const target_id =
      meta.target_id ?? (result as { id?: number } | null)?.id ?? undefined;
    auditWrite(env, { ...meta, target_id, ok: true });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    auditWrite(env, { ...meta, ok: false, error: message });
    console.error(`[${meta.tool}]`, message);
    throw err;
  }
}
