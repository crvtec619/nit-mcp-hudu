export type LocalEnv = Env & { HUDU_TEST_COMPANY_ID?: string };

export function assertSandboxCompany(companyId: number, env: LocalEnv): void {
  const sandbox = Number(env.HUDU_TEST_COMPANY_ID);
  if (!sandbox || companyId !== sandbox) {
    throw new Error(
      `Local-dev write refused: company_id ${companyId} is not the sandbox ` +
        `company (${sandbox || "<unset>"}). Set HUDU_TEST_COMPANY_ID in ` +
        `.env.local and only write to that company from local-dev.`
    );
  }
}
