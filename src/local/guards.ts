// Optional write-scope guard for the local connector.
//
// The local connector has full create/edit reach by default. Setting
// HUDU_WRITE_ALLOWLIST to a comma-separated list of company IDs restricts every
// write that targets a company to those IDs. Unset means allow all companies.

export type LocalEnv = Env & {
  HUDU_WRITE_ALLOWLIST?: string;
  HUDU_AUDIT_LOG?: string;
};

function parseAllowlist(env: LocalEnv): number[] | null {
  const raw = env.HUDU_WRITE_ALLOWLIST?.trim();
  if (!raw) return null;
  const ids = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
  return ids.length > 0 ? ids : null;
}

/**
 * Throw if HUDU_WRITE_ALLOWLIST is set and companyId is not a member.
 * No-op (full access) when the allowlist is unset. Pass undefined for writes
 * with no company scope (e.g. global KB articles); those are always allowed.
 */
export function assertWriteAllowed(
  companyId: number | undefined,
  env: LocalEnv
): void {
  const allow = parseAllowlist(env);
  if (!allow) return;
  if (companyId === undefined) return;
  if (!allow.includes(companyId)) {
    throw new Error(
      `Write refused: company_id ${companyId} is not in HUDU_WRITE_ALLOWLIST ` +
        `(${allow.join(", ")}). Remove the env var for full access, or add this company.`
    );
  }
}
