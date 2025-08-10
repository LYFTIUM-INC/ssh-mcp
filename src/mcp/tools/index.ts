import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSHService } from '../../index.js';
import { CreateSessionParams, ExecuteCommandParams, TransferFileParams, CloseSessionParams } from '../../types.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export function registerCoreTools(server: Server, sshService: SSHService) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: 'quick_connect', description: 'Connect to predefined servers', inputSchema: { type: 'object', properties: { serverName: { type: 'string' } }, required: ['serverName'] } },
      { name: 'create_ssh_session', description: 'Create custom SSH sessions', inputSchema: { type: 'object' } },
      { name: 'execute_remote_command', description: 'Run commands remotely', inputSchema: { type: 'object' } },
      { name: 'transfer_file', description: 'Upload/download files', inputSchema: { type: 'object' } },
      { name: 'close_session', description: 'Terminate sessions', inputSchema: { type: 'object' } },
      { name: 'list_sessions', description: 'View active sessions', inputSchema: { type: 'object' } }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const name = request.params.name as string;
    switch (name) {
      case 'quick_connect': {
        const { serverName } = request.params.arguments as { serverName: string };
        const sessionId = await sshService.quickConnect(serverName);
        return { content: [{ type: 'text', text: sessionId }] } as any;
      }
      case 'create_ssh_session': {
        const sessionId = await sshService.createSession(request.params.arguments as unknown as CreateSessionParams);
        return { content: [{ type: 'text', text: sessionId }] } as any;
      }
      case 'execute_remote_command': {
        const result = await sshService.executeCommand(request.params.arguments as unknown as ExecuteCommandParams);
        return { content: [{ type: 'text', text: result }] } as any;
      }
      case 'transfer_file': {
        const result = await sshService.transferFile(request.params.arguments as unknown as TransferFileParams);
        return { content: [{ type: 'text', text: result }] } as any;
      }
      case 'close_session': {
        await sshService.closeSession(request.params.arguments as unknown as CloseSessionParams);
        return { content: [{ type: 'text', text: 'ok' }] } as any;
      }
      case 'list_sessions': {
        const sessions = Array.from(sshService.sessions.keys());
        return { content: [{ type: 'text', text: JSON.stringify(sessions) }] } as any;
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });
}