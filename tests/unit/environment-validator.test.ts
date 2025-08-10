import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentValidator } from '../../src/config/environment-validator.js';

describe('EnvironmentValidator', () => {
  const validator = new EnvironmentValidator();
  const backupEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...backupEnv };
  });

  it('fails for unknown server', () => {
    const result = validator.validateServerConfig('unknown');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Unknown server');
  });

  it('detects missing required variables', () => {
    const result = validator.validateServerConfig('my-server');
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('MY_SERVER_HOST'))).toBe(true);
    expect(result.errors.some(e => e.includes('MY_SERVER_USERNAME'))).toBe(true);
  });

  it('validates with password auth', () => {
    process.env.MY_SERVER_HOST = 'example.com';
    process.env.MY_SERVER_USERNAME = 'user';
    process.env.MY_SERVER_PASSWORD = 'secret';
    const result = validator.validateServerConfig('my-server');
    expect(result.valid).toBe(true);
    expect(result.config?.host).toBe('example.com');
    expect(result.config?.username).toBe('user');
  });
});