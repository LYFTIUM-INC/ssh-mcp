import { describe, it, expect } from 'vitest';
import { CircuitBreaker, CircuitState } from '../../src/resilience/circuit-breaker.js';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

describe('CircuitBreaker', () => {
  it('records success and stays closed', async () => {
    const cb = new CircuitBreaker('test', { enableHealthChecks: false });
    const result = await cb.execute({ execute: async () => 'ok' });
    expect(result).toBe('ok');
    expect(cb.getHealthStatus().state).toBe(CircuitState.CLOSED);
  });

  it('opens after failures and rejects', async () => {
    const cb = new CircuitBreaker('test', { enableHealthChecks: false, failureThreshold: 1, timeout: 10 });
    await expect(cb.execute({ execute: async () => { throw new Error('boom'); } })).rejects.toThrow();
    // Next call should be rejected due to OPEN
    await expect(cb.execute({ execute: async () => 'ok' })).rejects.toThrow();
    const status = cb.getHealthStatus();
    expect([CircuitState.OPEN, CircuitState.HALF_OPEN]).toContain(status.state);
  });

  it('moves to half-open after timeout', async () => {
    const cb = new CircuitBreaker('test', { enableHealthChecks: false, failureThreshold: 1, timeout: 50 });
    await expect(cb.execute({ execute: async () => { throw new Error('boom'); } })).rejects.toThrow();
    await sleep(60);
    // Should attempt half-open
    try { await cb.execute({ execute: async () => 'recovered' }); } catch {/* ignore */}
    const state = cb.getHealthStatus().state;
    expect([CircuitState.HALF_OPEN, CircuitState.CLOSED]).toContain(state);
  });
});