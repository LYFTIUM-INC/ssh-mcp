import { describe, it, expect } from 'vitest';
import { CredentialProtectionManager } from '../../src/security/credential-protection.js';
import { AuditLogger } from '../../src/audit/audit-logger.js';

describe('CredentialProtectionManager', () => {
  it('stores credential and lists requiring rotation without decrypting', async () => {
    const mgr = new CredentialProtectionManager({}, new AuditLogger());
    const id = await mgr.storeCredential('u1', 'password', { username: 'u', secret: 's' } as any);
    expect(id).toBeTruthy();
    const toRotate = await mgr.getCredentialsRequiringRotation();
    expect(Array.isArray(toRotate)).toBe(true);
  });
});