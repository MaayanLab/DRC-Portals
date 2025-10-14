import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { IncomingMessage } from 'node:http';
import express from 'express';
import cors from 'cors';
import { initialize_tools } from './tools/index.js';
import authMiddleWare from './auth.js';
const server = new McpServer({
    name: 'cfde-mcp-server',
    version: '0.1.19'
});

initialize_tools(server)

// Set up Express and HTTP transport
const app = express();
// app.use(express.json());
app.use(cors({
    "origin": "*", // use "*" with caution in production
    "methods": "GET,POST,DELETE,OPTIONS",
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "exposedHeaders": [
        'mcp-session-id',
        'last-event-id',
        'mcp-protocol-version'
    ],
}));
app.use(authMiddleWare)
app.post('/mcp', async (req:any, res:any) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt("5000");
app.listen(port, () => {
    console.log(`CFDE MCP Server running on http://localhost:5000/mcp ${process.env.API_KEY}`);
}).on('error', (error:any) => {
    console.error('Server error:', error);
    process.exit(1);
});