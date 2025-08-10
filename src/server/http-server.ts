import http, { IncomingMessage, ServerResponse } from 'http';
import { PrometheusMetrics } from '../monitoring/prometheus-metrics.js';
import { SSHService } from '../index.js';

export interface HttpServerConfig {
  port: number;
}

export function startHttpServer(sshService: SSHService, metrics: PrometheusMetrics, config?: Partial<HttpServerConfig>) {
  const port = config?.port ?? parseInt(process.env.PROMETHEUS_PORT || '3001');
  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.url && req.url.startsWith('/metrics')) {
        const body = await metrics.getMetrics();
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end(body);
        return;
      }
      if (req.url === '/health') {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }));
        return;
      }
      res.statusCode = 404;
      res.end('Not Found');
    } catch {
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });
  server.listen(port);
  return server;
}