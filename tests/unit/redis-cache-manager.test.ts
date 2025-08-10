import { describe, it, expect, beforeEach } from 'vitest';
import { RedisCacheManager } from '../../src/cache/redis-cache-manager.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';

class MockRedisClient {
  private store = new Map<string, string>();
  async connect() {}
  async disconnect() {}
  on() {}
  async get(key: string) { return this.store.get(key) ?? null; }
  async set(key: string, value: string) { this.store.set(key, value); return 'OK'; }
  async setEx(key: string, _ttl: number, value: string) { this.store.set(key, value); return 'OK'; }
  async del(key: string) { this.store.delete(key); return 1; }
  async exists(key: string) { return this.store.has(key) ? 1 : 0; }
  async mGet(keys: string[]) { return keys.map(k => this.store.get(k) ?? null); }
  async keys(pattern: string) { const prefix = pattern.replace('*',''); return Array.from(this.store.keys()).filter(k => k.startsWith(prefix)); }
  async info() { return 'used_memory:0'; }
  async ping() { return 'PONG'; }
}

class TestableRedisCacheManager extends RedisCacheManager {
  // @ts-expect-error override private for testing
  createRedisClient() { return new MockRedisClient(); }
}

describe('RedisCacheManager (mocked)', () => {
  let cache: TestableRedisCacheManager;

  beforeEach(async () => {
    cache = new TestableRedisCacheManager({ keyPrefix: 't:', defaultTtl: 1 }, new AuditLogger());
    // @ts-expect-error access private
    cache.client = cache.createRedisClient();
    // @ts-expect-error set connected
    (cache as any).isConnected = true;
  });

  it('returns null on miss and stores value on set/get', async () => {
    const miss = await cache.get('missing');
    expect(miss).toBeNull();

    const ok = await cache.set('k', { x: 1 }, 5);
    expect(ok).toBe(true);

    const got = await cache.get<{ x: number }>('k');
    expect(got?.x).toBe(1);
  });

  it('supports ttl=0 (no expiry)', async () => {
    await cache.set('exp', 'v', 0);
    const v1 = await cache.get('exp');
    expect(v1).toBe('v');
  });
});