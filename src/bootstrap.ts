import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { config as dotenvConfig } from 'dotenv';
import { SSHService } from './index.js';
import { PrometheusMetrics } from './monitoring/prometheus-metrics.js';
import { startHttpServer } from './server/http-server.js';
import { createMcpServer } from './mcp/server.js';
import { registerCoreTools } from './mcp/tools/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenvConfig({ path: resolve(__dirname, '../.env'), override: false });

export function startApplication() {
  const sshService = new SSHService();
  const metrics = new PrometheusMetrics({}, sshService.auditLogger, sshService);
  startHttpServer(sshService, metrics);
  createMcpServer(sshService, registerCoreTools);
  return { sshService, metrics };
}

if (process.env.NODE_ENV !== 'test') {
  startApplication();
}