import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index";
import { AuthHandler } from "./auth-handler";

export type Props = {
  email: string;
  name: string;
  entraId: string;
};

export class HuduMcp extends McpAgent<Env, {}, Props> {
  server = new McpServer({
    name: "hudu-mcp",
    version: "1.0.0",
  });

  async init() {
    registerAllTools(this.server, this.env);
  }
}

export default new OAuthProvider({
  apiRoute: "/mcp",
  apiHandler: HuduMcp.serve("/mcp"),
  defaultHandler: AuthHandler,
  authorizeEndpoint: "/authorize",
  tokenEndpoint: "/token",
  clientRegistrationEndpoint: "/register",
});
