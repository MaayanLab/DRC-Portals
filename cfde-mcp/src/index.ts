import { MCPServer } from "mcp-framework";
import { APIKeyAuthProvider } from "mcp-framework";

const authProvider = new APIKeyAuthProvider({
  keys: [process.env.API_KEY || 'cfde-key'],
  headerName: "X-API-Key" // Optional, defaults to "X-API-Key"
});

const server = new MCPServer({
  transport: {
    type: "http-stream",
    options: {
      port: 5000,
      responseMode: "stream",
      cors: {
        allowOrigin: "*",
        allowMethods: "GET, POST, DELETE, OPTIONS",
        allowHeaders: "Content-Type, Accept, Authorization, x-api-key, Mcp-Session-Id, Last-Event-ID",
        exposeHeaders: "Content-Type, Authorization, x-api-key, Mcp-Session-Id",
        maxAge: "86400"
      },
      session: {
        enabled: true,
        headerName: "Mcp-Session-Id",
        allowClientTermination: false
      },
      resumability: {
        enabled: true,
        historyDuration: 300000 // 5 minutes in milliseconds
      },
    }
  }});

await server.start();