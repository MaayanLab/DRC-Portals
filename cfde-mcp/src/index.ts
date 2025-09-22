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
      cors: {
        allowOrigin: "*"
      },
      auth: {
        provider: authProvider,
        endpoints: {
          sse: true,    // Require auth for SSE connections
          messages: true // Require auth for messages
        }
      }
    }
  }});

server.start();