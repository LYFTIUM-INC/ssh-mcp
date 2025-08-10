import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { SSHService } from '../index.js';

export type ToolRegistrar = (server: Server, sshService: SSHService) => void;

export function createMcpServer(sshService: SSHService, registerTools: ToolRegistrar) {
  const server = new Server(
    { name: 'ssh-mcp', version: '0.1.0' },
    { capabilities: { tools: {} } }
  );
  const transport = new StdioServerTransport();

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
  });

  registerTools(server, sshService);

  server.connect(transport);
  return server;
}