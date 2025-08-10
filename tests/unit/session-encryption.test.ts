import { describe, it, expect } from 'vitest';
import { SessionEncryptionManager } from '../../src/security/session-encryption.js';

describe('SessionEncryptionManager', () => {
  it('encrypts and decrypts session data', async () => {
    const manager = new SessionEncryptionManager();
    const sessionId = 's1';
    const payload = { foo: 'bar', n: 42 };
    const enc = await manager.encryptSessionData(sessionId, payload, 'u1');
    const dec = await manager.decryptSessionData(enc);
    expect(dec).toEqual(payload);
  });
});