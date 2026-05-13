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

// OAuthProvider attaches the authenticated grant's props onto ctx.props
// before invoking the apiHandler. Standard ExecutionContext does not type this.
type AuthedExecutionContext = ExecutionContext & { props?: Props };

type McpRequestEnvelope = {
  method?: string;
  params?: { name?: string };
  id?: string | number;
};

async function peekMcpRequest(request: Request): Promise<{
  mcpMethod?: string;
  toolName?: string;
  rpcId?: string | number;
}> {
  if (request.method !== "POST") return {};
  try {
    const cloned = request.clone();
    const body = (await cloned.json()) as McpRequestEnvelope;
    return {
      mcpMethod: body.method,
      toolName: body.method === "tools/call" ? body.params?.name : undefined,
      rpcId: body.id,
    };
  } catch {
    // Non-JSON or empty body — nothing to log beyond the wrapper fields.
    return {};
  }
}

const apiHandler = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const start = Date.now();
    const props = (ctx as AuthedExecutionContext).props;
    const { mcpMethod, toolName, rpcId } = await peekMcpRequest(request);

    const server = new McpServer({
      name: "hudu-mcp",
      version: "1.0.0",
    });

    registerAllTools(server, env);

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);

    let status = 0;
    try {
      const response = await transport.handleRequest(request);
      status = response.status;
      return response;
    } finally {
      console.log(
        JSON.stringify({
          type: "audit",
          email: props?.email,
          entraId: props?.entraId,
          mcpMethod,
          tool: toolName,
          rpcId,
          status,
          durationMs: Date.now() - start,
        })
      );
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
