import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { registerAllTools } from "./tools/index";
import { AuthHandler } from "./auth-handler";

export type Props = {
  email: string;
  name: string;
  entraId: string;
};

const apiHandler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // @cloudflare/workers-oauth-provider attaches the authenticated user's
    // Props (set in auth-handler.ts via completeAuthorization) to ctx.props
    // before forwarding to the API handler. Inject the caller's email into
    // a scoped env so write tools can enforce per-user gates without
    // plumbing extra args through registerAllTools.
    const props = (ctx as unknown as { props?: Props }).props;
    const scopedEnv = { ...env, CALLER_EMAIL: props?.email ?? "" } as Env;

    const server = new McpServer({
      name: "hudu-mcp",
      version: "1.0.0",
    });

    registerAllTools(server, scopedEnv);

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);

    try {
      return await transport.handleRequest(request);
    } finally {
      await transport.close();
      await server.close();
    }
  },
};

export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler,
  defaultHandler: AuthHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
