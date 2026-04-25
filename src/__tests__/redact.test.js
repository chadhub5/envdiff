const {
  isSensitiveKey,
  redactEnv,
  redactDiff,
  REDACTED,
  DEFAULT_SENSITIVE_PATTERNS,
} = require('../redact');

describe('isSensitiveKey', () => {
  test('matches common sensitive key names', () => {
    expect(isSensitiveKey('DB_PASSWORD')).toBe(true);
    expect(isSensitiveKey('API_KEY')).toBe(true);
    expect(isSensitiveKey('AUTH_TOKEN')).toBe(true);
    expect(isSensitiveKey('PRIVATE_KEY')).toBe(true);
    expect(isSensitiveKey('APP_SECRET')).toBe(true);
  });

  test('does not match non-sensitive keys', () => {
    expect(isSensitiveKey('APP_NAME')).toBe(false);
    expect(isSensitiveKey('PORT')).toBe(false);
    expect(isSensitiveKey('NODE_ENV')).toBe(false);
    expect(isSensitiveKey('LOG_LEVEL')).toBe(false);
  });

  test('supports custom patterns', () => {
    const custom = [/^VAULT_/i];
    expect(isSensitiveKey('VAULT_ADDR', custom)).toBe(true);
    expect(isSensitiveKey('API_KEY', custom)).toBe(false);
  });
});

describe('redactEnv', () => {
  const env = {
    APP_NAME: 'myapp',
    DB_PASSWORD: 'supersecret',
    API_KEY: 'abc123',
    PORT: '3000',
  };

  test('redacts sensitive keys and leaves others intact', () => {
    const result = redactEnv(env);
    expect(result.APP_NAME).toBe('myapp');
    expect(result.PORT).toBe('3000');
    expect(result.DB_PASSWORD).toBe(REDACTED);
    expect(result.API_KEY).toBe(REDACTED);
  });

  test('returns a new object without mutating input', () => {
    const result = redactEnv(env);
    expect(env.DB_PASSWORD).toBe('supersecret');
    expect(result).not.toBe(env);
  });
});

describe('redactDiff', () => {
  const diffEntries = [
    { key: 'APP_NAME', status: 'ok', values: { '.env': 'myapp', '.env.prod': 'myapp' } },
    { key: 'DB_PASSWORD', status: 'mismatch', values: { '.env': 'dev_pass', '.env.prod': 'prod_pass' } },
    { key: 'PORT', status: 'missing', values: { '.env': '3000', '.env.prod': undefined } },
  ];

  test('redacts values for sensitive keys only', () => {
    const result = redactDiff(diffEntries);
    expect(result[0].values['.env']).toBe('myapp');
    expect(result[1].values['.env']).toBe(REDACTED);
    expect(result[1].values['.env.prod']).toBe(REDACTED);
  });

  test('preserves undefined for missing entries after redaction', () => {
    const sensitiveEntry = [
      { key: 'API_KEY', status: 'missing', values: { '.env': 'key123', '.env.prod': undefined } },
    ];
    const result = redactDiff(sensitiveEntry);
    expect(result[0].values['.env']).toBe(REDACTED);
    expect(result[0].values['.env.prod']).toBeUndefined();
  });

  test('does not mutate original entries', () => {
    redactDiff(diffEntries);
    expect(diffEntries[1].values['.env']).toBe('dev_pass');
  });
});
