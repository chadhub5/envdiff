const { entropy, classifyValue, isSensitiveKey, scanSecrets, secretSummary } = require('../envSecret');

describe('entropy', () => {
  it('returns 0 for single-char string', () => {
    expect(entropy('aaaa')).toBe(0);
  });

  it('returns higher value for random-looking string', () => {
    expect(entropy('aB3$xZ9!qR2@mN7&')).toBeGreaterThan(3);
  });
});

describe('classifyValue', () => {
  it('detects JWT tokens', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    expect(classifyValue(jwt)).toBe('jwt');
  });

  it('detects URLs with credentials', () => {
    expect(classifyValue('postgres://user:pass@localhost/db')).toBe('url_with_creds');
  });

  it('returns null for plain values', () => {
    expect(classifyValue('localhost')).toBeNull();
    expect(classifyValue('3000')).toBeNull();
  });

  it('detects high-entropy strings', () => {
    expect(classifyValue('aB3$xZ9!qR2@mN7&pQ5^')).toBe('high_entropy');
  });
});

describe('isSensitiveKey', () => {
  it('flags password keys', () => expect(isSensitiveKey('DB_PASSWORD')).toBe(true));
  it('flags token keys', () => expect(isSensitiveKey('ACCESS_TOKEN')).toBe(true));
  it('flags api key keys', () => expect(isSensitiveKey('STRIPE_API_KEY')).toBe(true));
  it('does not flag safe keys', () => expect(isSensitiveKey('PORT')).toBe(false));
  it('does not flag host keys', () => expect(isSensitiveKey('DB_HOST')).toBe(false));
});

describe('scanSecrets', () => {
  it('returns findings for sensitive keys', () => {
    const env = { DB_PASSWORD: 'hunter2', PORT: '3000' };
    const findings = scanSecrets(env);
    expect(findings).toHaveLength(1);
    expect(findings[0].key).toBe('DB_PASSWORD');
  });

  it('returns empty array when no secrets', () => {
    const env = { PORT: '3000', NODE_ENV: 'production' };
    expect(scanSecrets(env)).toHaveLength(0);
  });

  it('detects JWT in non-sensitive key name', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const findings = scanSecrets({ SOME_VALUE: jwt });
    expect(findings[0].byValue).toBe('jwt');
  });
});

describe('secretSummary', () => {
  it('builds correct summary', () => {
    const findings = [
      { key: 'A', reason: 'jwt', byKey: false, byValue: 'jwt' },
      { key: 'B', reason: 'sensitive_key', byKey: true, byValue: null },
    ];
    const s = secretSummary(findings);
    expect(s.total).toBe(2);
    expect(s.byReason.jwt).toBe(1);
    expect(s.keys).toEqual(['A', 'B']);
  });
});
